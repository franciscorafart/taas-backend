import redisClient from "../config/redis-client";

const checkRedisToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const redisResponse = await redisClient.exists(token);
    // const ttl = await redisClient.ttl(token); // Time for expiry

    if (redisResponse) {
      next();
    } else {
      res.status(400).send(
        JSON.stringify({
          success: false,
          msg: "Token not valid or session expired",
        })
      );
    }
  } catch (e) {
    res
      .status(500)
      .send(JSON.stringify({ success: false, msg: "Token auth failed" }));
  }
};

export default checkRedisToken;
