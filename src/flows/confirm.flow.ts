import { addKeyword, EVENTS } from "@builderbot/bot";
import { clearHistory } from "../utils/handleHistory";
import { addMinutes, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { addToCalendar } from "src/services/calendar";


const TIME_ZONE = process.env.TZ

/**
 * Encargado de pedir los datos necesarios para registrar el evento en el calendario
 */
const flowConfirm = addKeyword(EVENTS.ACTION).addAction(async (_, { state, flowDynamic }) => {
      
    await flowDynamic([
        `Vale, voy a pedirte que confirmes los datos para agendar`,
        `¿El Nombre para agendar es ${state.get('name')} y el email facilitado es ${state.get('email')} ? ',
        'Debes de afirmar con *si* o denegar con *cancelar*`])
   
    }).addAction({ capture: true }, async (ctx, { state, flowDynamic, fallBack , endFlow }) => {

        if (ctx.body.toLocaleLowerCase().includes('cancelar')) {
            clearHistory(state)
            return endFlow(`¿decidiste NO Agendar Como puedo ayudarte?`)
        }
        if (!ctx.body.toLocaleLowerCase().includes('si')) {
            return fallBack('Debes de afirmar con *si* o denegar con *cancelar*')
        }
        const DURATION_MEET= state.get('duracion') ?? process.env.DURATION_MEET

        const dateObject = {
            name: state.get('name'),
            email: state.get('email'),
            startDate: utcToZonedTime(state.get('desiredDate'), TIME_ZONE),
            endDate: utcToZonedTime(addMinutes(state.get('desiredDate'), +DURATION_MEET), TIME_ZONE),
            phone: ctx.from,
            servicio:state.get('servicio'),
            profesional:state.get('profesional'),
            duracion:state.get('duracion'),
            calendario:state.get('calendario')
        }
        await flowDynamic(`Dame un momento trato de agendarte con ${state.get('profesional')}....`)
        await addToCalendar(dateObject)
        const nom=state.get('name')
        clearHistory(state)
        return endFlow(`Listo! ${nom} agendado que tengas un Buen dia`)
})

export { flowConfirm }