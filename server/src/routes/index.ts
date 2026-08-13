import { Router } from "express";
import authRouter from "./auth.routes.js";
import catRouter from "./cat.routes.js";
import bookingRouter from "./booking.routes.js";
import winnerRouter from "./winner.routes.js";
import contentRouter from "./content.routes.js";
import contactRouter from "./contact.routes.js";
import adminRouter from "./admin.routes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/cats", catRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/winners", winnerRouter);
apiRouter.use("/contacts", contactRouter);
apiRouter.use("/", contentRouter); // /content, /settings
apiRouter.use("/admin", adminRouter); // stats, uploads, admin listings

export default apiRouter;
