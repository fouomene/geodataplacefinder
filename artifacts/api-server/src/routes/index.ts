import { Router, type IRouter } from "express";
import healthRouter from "./health";
import searchRouter from "./search";
import reverseRouter from "./reverse";
import nearestRouter from "./nearest";

const router: IRouter = Router();

router.use(healthRouter);
router.use(searchRouter);
router.use(reverseRouter);
router.use(nearestRouter);

export default router;
