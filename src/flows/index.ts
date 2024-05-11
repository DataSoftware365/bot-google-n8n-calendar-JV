import { createFlow } from "@builderbot/bot";

import { welcomeFlow } from "./welcome.flow";
import { flowSeller } from "./seller.flow";
import { flowSchedule , flowScheduleNewDate } from "./schedule.flow";
import { flowConfirm } from "./confirm.flow";
import { registerFlow } from "./register.flow";
import { flowServicios } from "./services.flow";
import { flowProfessional } from "./professional.flow";
import { flowIsNowClient } from "./notIsClient.flow";
import { flowthisClient } from "./thisClient.flow";
import { flowNewService } from "./newService.flow";
import { flowDelService } from "./delService.flow";
import { voiceFlow } from "./voice.flow";

export default createFlow([
    welcomeFlow,
    flowSeller,
    flowSchedule,
    flowConfirm,
    registerFlow,
    flowServicios,
    flowProfessional,
    flowIsNowClient,
    flowthisClient,
    flowNewService,
    flowDelService,
    flowScheduleNewDate,
    voiceFlow

])