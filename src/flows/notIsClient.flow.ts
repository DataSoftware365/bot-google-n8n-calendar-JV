import { addKeyword, EVENTS,utils } from "@builderbot/bot";
import { flowProfessional } from "./professional.flow";
import { flowSchedule } from "./schedule.flow";
import { flowNewService } from "./newService.flow";


const flowIsNowClient = addKeyword(EVENTS.ACTION).addAction(async (_, { flowDynamic }) => {
    await flowDynamic([
    'Hola veo que usas por primera vez nuestros servicios,Bienvenido/a !!',
    '¿ Puedes decirme tu nombre ?'])
  })
    .addAction({ capture: true }, async (ctx, { state , flowDynamic }) => {
            await state.update({ name: ctx.body }) 
            await flowDynamic(`Por ultimo ¿Puedes decirme tu email ?`)   
        })
        .addAction({ capture: true }, async (ctx, { state, globalState , gotoFlow, fallBack , flowDynamic}) => {
            const email = ctx.body;
            const regEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Expresión regular para validar un correo electrónico
        
            if (!regEx.test(email)) {
            return fallBack('El correo electrónico ingresado no es válido. Por favor intenta nuevamente.')
            }       
            await state.update({ email: ctx.body })
            return gotoFlow(flowNewService)

        })             

    export {flowIsNowClient}