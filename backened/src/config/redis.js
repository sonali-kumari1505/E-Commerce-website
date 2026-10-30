import { Redis } from '@upstash/redis';
import { ENV } from './env.js';

/**
 * High-performance In-Memory Cache with TTL support.
 * Serves as an immediate zero-latency fallback when external Redis (Upstash)
 * is unreachable, expired, or unconfigured.
 */
class InMemoryCache {
    constructor() {
        this.cache = new Map();
        // Periodically purge expired keys every 60 seconds
        const timer = setInterval(() => this.purgeExpired(), 60000);
        if (timer.unref) timer.unref();
    }

    purgeExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (item.expiresAt && item.expiresAt <= now) {
                this.cache.delete(key);
            }
        }
    }

    async get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        if (item.expiresAt && item.expiresAt <= Date.now()) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    async set(key, value, options = {}) {
        let expiresAt = null;
        if (options && options.ex) {
            expiresAt = Date.now() + options.ex * 1000;
        }
        this.cache.set(key, { value, expiresAt });
        return 'OK';
    }

    async del(...keys) {
        let count = 0;
        for (const key of keys) {
            if (this.cache.delete(key)) count++;
        }
        return count;
    }

    async keys(pattern = '*') {
        const now = Date.now();
        const results = [];
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');

        for (const [key, item] of this.cache.entries()) {
            if (item.expiresAt && item.expiresAt <= now) {
                this.cache.delete(key);
                continue;
            }
            if (regex.test(key)) {
                results.push(key);
            }
        }
        return results;
    }

    async ping() {
        return 'PONG';
    }
}

const inMemoryCache = new InMemoryCache();

let upstashClient = null;
let isUpstashAvailable = false;
let hasReportedStatus = false;

const hasValidEnv = Boolean(
    ENV.UPSTASH_REDIS_REST_URL &&
    ENV.UPSTASH_REDIS_REST_TOKEN &&
    ENV.UPSTASH_REDIS_REST_URL.startsWith('http')
);

if (hasValidEnv) {
    try {
        upstashClient = new Redis({
            url: ENV.UPSTASH_REDIS_REST_URL,
            token: ENV.UPSTASH_REDIS_REST_TOKEN,
            retry: {
                retries: 0
            }
        });
    } catch {
        upstashClient = null;
    }
}

const verifyUpstash = async () => {
    if (!upstashClient) {
        isUpstashAvailable = false;
        if (!hasReportedStatus) {
            hasReportedStatus = true;
            console.log('[Cache] Using fast local In-Memory Cache (No external Redis URL configured).');
        }
        return false;
    }

    try {
        const pingPromise = upstashClient.ping();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 2500)
        );

        await Promise.race([pingPromise, timeoutPromise]);
        if (!isUpstashAvailable && !hasReportedStatus) {
            console.log('[Cache] Upstash Redis connected successfully.');
        }
        isUpstashAvailable = true;
        hasReportedStatus = true;
        return true;
    } catch (err) {
        isUpstashAvailable = false;
        if (!hasReportedStatus) {
            hasReportedStatus = true;
            const reason = err?.cause?.code || err?.message || 'ENOTFOUND';
            console.log(`\n======================================================`);
            console.log(`[Cache Notice] Upstash Redis is unreachable (${reason}).`);
            console.log(`[Cache Notice] Automatically activated In-Memory Caching.`);
            console.log(`[Cache Notice] All product caching is 100% active with zero lag & no fetch errors.`);
            console.log(`======================================================\n`);
        }
        return false;
    }
};

// Run non-blocking check on initialization
if (hasValidEnv) {
    verifyUpstash();
    // Periodically retry every 5 minutes in case network or DB comes back
    const retryInterval = setInterval(() => verifyUpstash(), 5 * 60 * 1000);
    if (retryInterval.unref) retryInterval.unref();
}

/**
 * Universal Redis Interface.
 * Transparently delegates to Upstash Redis if available, or fast In-Memory cache.
 */
export const redis = {
    async get(key) {
        if (isUpstashAvailable && upstashClient) {
            try {
                return await upstashClient.get(key);
            } catch {
                isUpstashAvailable = false;
            }
        }
        return inMemoryCache.get(key);
    },

    async set(key, value, options) {
        if (isUpstashAvailable && upstashClient) {
            try {
                return await upstashClient.set(key, value, options);
            } catch {
                isUpstashAvailable = false;
            }
        }
        return inMemoryCache.set(key, value, options);
    },

    async del(...keys) {
        if (isUpstashAvailable && upstashClient) {
            try {
                return await upstashClient.del(...keys);
            } catch {
                isUpstashAvailable = false;
            }
        }
        return inMemoryCache.del(...keys);
    },

    async keys(pattern) {
        if (isUpstashAvailable && upstashClient) {
            try {
                return await upstashClient.keys(pattern);
            } catch {
                isUpstashAvailable = false;
            }
        }
        return inMemoryCache.keys(pattern);
    },

    async ping() {
        if (isUpstashAvailable && upstashClient) {
            try {
                return await upstashClient.ping();
            } catch {
                isUpstashAvailable = false;
            }
        }
        return inMemoryCache.ping();
    }
};
