import { addKeyword, EVENTS,utils } from "@builderbot/bot";
import { flowNewService } from "./newService.flow";
import { flowDelService } from "./delService.flow";

 const isNumeric = (val: string) : boolean => {
   return !isNaN(Number(val));
}



const flowthisClient = addKeyword(EVENTS.ACTION).addAction(async (_, {state, globalState , flowDynamic ,gotoFlow ,endFlow}) => {
    
    await flowDynamic(`Hola ${state.get('name')} un placer contactar de nuevo`)
    const List= globalState.get('Lastservices')

    //Tendremos sus ultimos servicios recuperados
    /**
     * Si los servicios no son posteriores a hoy
     * son servicios pasados solo le preguntaos por que servicio dese de nuevo
     * Si tiene servicios futuros le preguntaos si queires cancelar o reagendar
     * o si quiere concertar otra cita nueva 
     */
    const currentD = new Date()
         
    const FutureAppointments = List.filter(function (serviciosolicitado) {
                                    //console.log(new Date(serviciosolicitado.start))
                                    return new Date(serviciosolicitado.start) > currentD
                            })
                            
    console.log(`FutureAppointments:${FutureAppointments}`)

   await globalState.update({ FutureAppointments: FutureAppointments })
   
    if(FutureAppointments.length<=0){
        //no teneos ninguna cita
        console.log('sin citas')
        await flowDynamic('¿Quieres una nueva cita??')
         
    }
    
    if(FutureAppointments.length===1){
        console.log('una cita pendiente')
        await state.update({ name: FutureAppointments[0].nombre })
        await state.update({ email: FutureAppointments[0].email })
        await state.update({ servicio: FutureAppointments[0].servicio })
        await state.update({ profesional:FutureAppointments[0].profesional})
        await state.update({ cita:FutureAppointments[0].start})
        await state.update({ idevent:FutureAppointments[0].idEvent})
        await state.update({ calendario:FutureAppointments[0].calendario})         
        await state.update({ row_number:FutureAppointments[0].row_number})

        await flowDynamic([`Tienes agendado con nosotros para el dia ${FutureAppointments[0].start}`,
         `para esta cita puedes *cancelar* o tambien *reagendar* como no una *nueva* cita`,`¿Que podemos hacer por ti?`])

    }else if(FutureAppointments.lengt>1){
        console.log('Varias citas pendientes')
        await flowDynamic(`Tienes agendado con nosotros varias citas`)
        for (var i = 0; i < FutureAppointments.length; i++) { 
            await flowDynamic(`${i+1} - cita el dia ${FutureAppointments[i].start} `)          
        }
        await flowDynamic([`para estas cita puedes poner *numero,accion* las acciones 
                       puden ser *salir*, *cancelar* o *reagendar* 
                       como no una *nueva* cita esta no necesita numerador`,`¿Que podemos hacer por ti?`])
    }
      
})
.addAction({ capture: true }, async (ctx, { state ,globalState, flowDynamic, gotoFlow , endFlow, fallBack}) => {
    //mirar si la accion tiene un umero delante
     const valprimerdigito=ctx.body.substring(0,1)
     const FutureAppointments= globalState.get('FutureAppointments')

    if(ctx.body.toLocaleLowerCase().includes('cancelar') || ctx.body.toLocaleLowerCase().includes('reagendar') ){
 
        if(FutureAppointments.length<=0){
            return fallBack('No tienes actualment ninguna cita con nosotros,puedes pedir una *nueva* si lo deseas')
        }
        
        //Borrar Cita  
        await globalState.update({ valprimerdigito: valprimerdigito })
        await globalState.update({ accionborrado: ctx.body.substring(2,10) })
        return gotoFlow(flowDelService)}

    if(ctx.body.toLocaleLowerCase().includes('nueva')){
        return gotoFlow(flowNewService)
    }else{
         return fallBack('debes de decirme un valor valido de lo expuesto')}

})


export {flowthisClient}