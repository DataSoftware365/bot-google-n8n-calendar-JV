import { addKeyword, EVENTS,utils } from "@builderbot/bot";
import { flowSchedule } from "./schedule.flow";

const DURATION_MEET = process.env.DURATION_MEET ?? 45
const CALENDAR_GENERIC = process.env.CALENDAR_GENERIC ?? ''
const CALENDAR_GENERIC_PROFESIONAL = process.env.CALENDAR_GENERIC_PROFESIONAL?? 'No named'

if (!CALENDAR_GENERIC || CALENDAR_GENERIC.length === 0) {
    throw new Error("CALENDAR_GENERIC is missing");
}

const flowProfessional = addKeyword(EVENTS.ACTION).addAction(async (_, {  state, globalState , flowDynamic }) => {

        const listaservicios= globalState.get('listaservicios')
        const servicio=state.get('servicio') //servicio que solicito en el paso anterior pueden ser varios por comas

        
        //buscar en esta lista que profesionales realizan este servicio que esta en state.servicio
        //reducir la lista a solo los profesioanles que dan este servicio
        //Mirar si son varios servicios por comas poner en el generico      
       
        const listaProfesionales = listaservicios.filter(function (serviciosolicitado) {
            return (serviciosolicitado.servicio.includes(servicio))
        })
          
          console.log(listaProfesionales)

          const profesionales=listaProfesionales.map((i) =>i.profesional.split(' ').shift())//[jun,pedro,antonio]

          await globalState.update({profesionales:profesionales})
          await globalState.update({listaProfesionales:listaProfesionales})

          await flowDynamic([`¿Con quien deseas agendar el servicio de ${state.get('servicio')}?.`,
                             'Estos son nuestros profesionales',
                             `*${profesionales}*`,
                            'Si lo prefieres pon *auto* y te agendaremos en automatico'])
         
        })
        .addAction({ capture: true }, async (ctx, { state, globalState ,  fallBack , flowDynamic }) => {             
                
            const profesionales=globalState.get('profesionales')       
            const listaProfesionales=globalState.get('listaProfesionales')

            if (ctx.body.toLocaleLowerCase()==='auto') {
                //sera auto y no uno de la lista
                //'sacar de esta lista *auto*'
                await state.update({profesional:CALENDAR_GENERIC_PROFESIONAL})
                await state.update({duracion:DURATION_MEET})
                await state.update({calendario:CALENDAR_GENERIC})  
 
            } 
            else
            {
                //sacar de la lista el solicitado
                // 
                const servicioSelect=state.get('servicio')
                
                const findElement=listaProfesionales.findIndex(
                    element => element.servicio.toLocaleLowerCase().includes(servicioSelect.toLocaleLowerCase()) &&
                    element.profesional.toLocaleLowerCase() === ctx.body.toLocaleLowerCase() ) ?? -1;

                console.log(`Encotrado:${findElement}`)
                console.log(`profesiona:${ctx.body}`)
                console.log(`servicio:${servicioSelect}`)

                if (findElement>=0){
                    await state.update({profesional:ctx.body})
                    await state.update({duracion:listaProfesionales[findElement].duracion})
                    await state.update({calendario:listaProfesionales[findElement].calendario}) 
                }
                else
                {
                    //NO DEBERIA DE PASAR ESTA TODO BIEN PERO PUSO UN QUE NO ERA DE LA lista???
                    return fallBack('Lo escrito no es un profesional valido.Reintenta')
                }
                
            }
            await flowDynamic("Perfecto!! vamos con la fecha ¿Que dia y hora te viene bien para esto?")
        })    
        .addAction({ capture: true }, async (ctx, { gotoFlow, state }) => {

            console.log(`Solicitud: ${ctx.body}`)
            return gotoFlow(flowSchedule)
        })
    

export { flowProfessional }
