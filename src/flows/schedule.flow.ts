import { addKeyword, EVENTS } from "@builderbot/bot";
import AIClass from "../services/ai";
import { getHistoryParse, handleHistory, clearHistory } from "../utils/handleHistory";
import { generateTimer } from "../utils/generateTimer";
import { getCurrentCalendar } from "../services/calendar";
import { getFullCurrentDate } from "src/utils/currentDate";
import { flowConfirm } from "./confirm.flow";
import { addMinutes, isWithinInterval, format, parse } from "date-fns";
import { flowHorario } from "./horario.flow";

const PROMPT_FILTER_DATE = `
### Contexto
Eres un asistente de inteligencia artificial. Tu propósito es determinar la fecha y hora que el cliente quiere, en el formato yyyy/MM/dd HH:mm:ss.

### Fecha y Hora Actual:
{CURRENT_DAY}

### Registro de Conversación:
{HISTORY}

Asistente: "{respuesta en formato (yyyy/MM/dd HH:mm:ss)}"
`;

const generatePromptFilter = (history: string) => {
    const nowDate = getFullCurrentDate();
    const mainPrompt = PROMPT_FILTER_DATE
        .replace('{HISTORY}', history)
        .replace('{CURRENT_DAY}', nowDate);

    return mainPrompt;
}

const flowSchedule = addKeyword(EVENTS.ACTION).addAction(async (_, { extensions, state,  flowDynamic, gotoFlow }) => {
    await flowDynamic('Dame un momento para consultar la agenda de '+state.get('profesional') + ' ...');
    const ai = extensions.ai as AIClass;
    const history = getHistoryParse(state)

    const list = await getCurrentCalendar(state.get('calendario'))
    const listParse = list
        .map(({ start, end }) => ({ fromDate: new Date(start), toDate: new Date(end) }));

    console.log(`Horas Agendadas`)
    console.log(listParse)

    const promptFilter = generatePromptFilter(history);
    console.log(`promptFilter Time:${promptFilter}`)

    const { date } = await ai.desiredDateFn([
        {
            role: 'system',
            content: promptFilter
        }
    ]);

    const desiredDate = parse(date, 'yyyy/MM/dd HH:mm:ss', new Date());
    
    console.log(`desiredDate:${desiredDate}`)

    const isDateAvailable = listParse.every(({ fromDate, toDate }) => !isWithinInterval(desiredDate, { start: fromDate, end: toDate }));

    if (!isDateAvailable) {
        const m = 'Lo siento, esa hora no esta disponible ya está reservada';
        await flowDynamic(m);
        await handleHistory({ content: m, role: 'assistant' }, state);
        await state.update({ desiredDate: null })
        return gotoFlow(flowScheduleNewDate)
    }
 
    const DURATION_MEET= state.get('duracion') ?? process.env.DURATION_MEET ;

    const formattedDateFrom = format(desiredDate, 'hh:mm a');
    const formattedDateTo = format(addMinutes(desiredDate, +DURATION_MEET), 'hh:mm a');
    const message = `¡Perfecto! Tenemos disponibilidad de ${formattedDateFrom} a ${formattedDateTo} el día ${format(desiredDate, 'dd/MM/yyyy')}. ¿Confirmo tu reserva? *si*`;
    await handleHistory({ content: message, role: 'assistant' }, state);
    await state.update({ desiredDate })

    const chunks = message.split(/(?<!\d)\.\s+/g);
    for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
    }

}).addAction({ capture: true }, async ({ body }, { gotoFlow }) => {

    if (body.toLowerCase().includes('si')) {
        //vamos a agendar
        return gotoFlow(flowConfirm)
    }
    //otra fecha y hora o cancelar
    return gotoFlow(flowScheduleNewDate)
})

/**
 * Encargado de repertir otras fechas y hora
 */

const flowScheduleNewDate = addKeyword(EVENTS.ACTION).addAction(async (_, { state,  flowDynamic  }) => {
    
    await flowDynamic('¿Alguna otra fecha y hora que te vaya mejor?')
    await flowDynamic('Puedes *cancelar* si no deseas continuar')
})
    .addAction({ capture: true }, async ({ body }, { gotoFlow,  state ,endFlow}) => {
        //cancelar o sigue viendo si es una hora
        if (body.toLowerCase().includes('cancelar')){ 
            clearHistory(state)
            return endFlow ('Gracias que tengas un buen dia!!!')
        } 
        const history = getHistoryParse(state)
        const promptFilter = generatePromptFilter(history)
        
        await state.update({ desiredDate: null })
        console.log(`prompt para nueva fecha:${promptFilter}`)
        return gotoFlow(flowSchedule)
})


export { flowSchedule,flowScheduleNewDate }