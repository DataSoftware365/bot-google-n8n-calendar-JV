import { addKeyword, EVENTS,utils } from "@builderbot/bot";
import { clearHistory } from "../utils/handleHistory";
import { delToCalendar } from "src/services/calendar";
import { flowNewService } from "./newService.flow";

const isNumeric = (val: string) : boolean => {
    return !isNaN(Number(val));
 }
const flowDelService = addKeyword(EVENTS.ACTION).addAction(async (_, {state, globalState , flowDynamic}) => {
    
    const FutureAppointments = globalState.get('FutureAppointments')
    const valprimerdigito=globalState.get('valprimerdigito')

    if(isNumeric(valprimerdigito)){
        await state.update({ name: FutureAppointments[valprimerdigito-1].nombre })
        await state.update({ email: FutureAppointments[valprimerdigito-1].email })
        await state.update({ servicio: FutureAppointments[valprimerdigito-1].servicio })
        await state.update({ profesional:FutureAppointments[valprimerdigito-1].profesional})
        await state.update({ cita:FutureAppointments[valprimerdigito-1].start})
        await state.update({ idevent:FutureAppointments[valprimerdigito-1].idevent})
        await state.update({ calendario:FutureAppointments[valprimerdigito-1].calendario})
        await state.update({ row_number:FutureAppointments[valprimerdigito-1].row_number})  
    }else{
        await state.update({ name: FutureAppointments[0].nombre })
        await state.update({ email: FutureAppointments[0].email })
        await state.update({ servicio: FutureAppointments[0].servicio })
        await state.update({ profesional:FutureAppointments[0].profesional})
        await state.update({ cita:FutureAppointments[0].start})
        await state.update({ idevent:FutureAppointments[0].idevent})
        await state.update({ calendario:FutureAppointments[0].calendario})
        await state.update({ row_number:FutureAppointments[0].row_number})  
    }
    await flowDynamic([
       
        `Vale,${state.get('name')} vamos a ${state.get('accionborrado')} la cita que selecionaste voy a pedirte que confirmes los datos`,
        `El Nombre con el que  agendaste fue ${state.get('name')} y el email que usaste 
         fue ${state.get('email')} con ${state.get('profesional')} para la cita del dia ${state.get('cita')}',
        '¿Deseas ${state.get('accionborrado')} esta cita? Debes de afirmar con *si* o denegar con *cancelar*`])   
})
.addAction({ capture: true }, async (ctx, { state, globalState, flowDynamic, fallBack , gotoFlow, endFlow }) => {
    if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
        clearHistory(state)
        return endFlow(`¿decidiste *NO ${state.get('accionborrado')}* Como puedo ayudarte?`)
    }
    if (!ctx.body.toLocaleLowerCase().includes('si')) {
        return fallBack('Debes de afirmar con *si* o denegar con *cancelar*')
    }
    const dateObject = {
        idevent:state.get('idevent'),
        email:state.get('email'),
        calendario:state.get('calendario'),
        row_number:state.get('row_number')
    }
    await flowDynamic(`Dame un momento trato de ${state.get('accionborrado')} con ${state.get('profesional')}....`)
    
    const resp = await delToCalendar(dateObject)
    const accion =globalState.get('accionborrado')

    //mirar si devuelve 200
    const nom=state.get('name')
    //segun reagendar = enviar de nuevo
    if (accion === 'reagendar'){ return gotoFlow(flowNewService)}
    clearHistory(state)
    return flowDynamic(`Listo! ${nom} se ha ${state.get('accionborrado')} tu cita que tengas un Buen dia`)
})
export {flowDelService}