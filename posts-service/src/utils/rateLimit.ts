import rateLimit from "express-rate-limit";

const setRateLimitMiddleware = (minute: number, maxRequest: number, message: string) => {
    return rateLimit({
        windowMs: minute * 60 * 1000,
        max: maxRequest,
        message: {
            errors: [
                {
                    message
                }
            ]
        },
        standardHeaders: true,
        legacyHeaders: false
    })
}

export default setRateLimitMiddleware;