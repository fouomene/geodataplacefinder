import { Router, type IRouter } from "express";
import healthRouter from "./health";
import searchRouter from "./search";
import reverseRouter from "./reverse";
import nearestRouter from "./nearest";
import placeRouter from "./place";

const router: IRouter = Router();

router.use(healthRouter);
router.use(searchRouter);
router.use(reverseRouter);
router.use(nearestRouter); // must come before placeRouter so /places/nearest matches first
router.use(placeRouter);

export default router;
