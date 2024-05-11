import { addKeyword, EVENTS,utils } from "@builderbot/bot";
import { getHistory, getHistoryParse, handleHistory } from "../utils/handleHistory";
import { flowIsNowClient } from "./notIsClient.flow";
import { flowthisClient } from "./thisClient.flow";
import { getThisIsClient } from "src/services/clients";
import { ListServices } from "src/services/services";
 
const flowServicios = addKeyword(EVENTS.ACTION).addAction(async (_, { state, globalState , flowDynamic , gotoFlow }) => {
   
    /**
     * Mirar en la hoja de google,base de datossi es nuevo o es un cliente del negocio
     * Optional mirar en un wordflow de retool o n8n de una db retool
     * recuperar nombre,mail etc veamos si tiene agendado algo asi sabemos que ya es cliente
     * y ademas lo podemos usar para cancelar,reagendar o lo que sea que quiera uno/a
     * 
     */
    
    console.clear()

    //cargarnos los servicios de nuestro repo de servicios para usar despues
    const dataListServices= await ListServices()
    
    console.log(`data to ListServices:${dataListServices}`)
    
    const ListapalabrasClave=dataListServices.map((u) =>u.servicio.split(' ').shift())
    
    
    
    //Remover si hay duplicados en la lista de palabras claves
    const palabrasClave = ListapalabrasClave.filter((item,index)=>{return ListapalabrasClave.indexOf(item) === index})

    await globalState.update({servicios:palabrasClave})
    await globalState.update({listaservicios:dataListServices})

    console.log(`Lista palabras Clave:${palabrasClave}`)
    console.log(`Lista de servicios : ${dataListServices}`)

    //Mirar si es cliente del negocio segun el dispositivo desde el que conecta
    //const list = await getThisIsClient(state.from)

    //esto para no trener que hacer n8n
    const list=[] //vacio para que sea uno nuevo que no tiene nada solo para provar en prod dekar que lea

    const listParse = list
    .map(({nombre,email, start, end ,servicio,profesional,idevent,calendario,row_number}) => ({nombre:nombre,email:email, fromDate: new Date(start), toDate: new Date(end),servicio: servicio,profesional: profesional, idevent: idevent,calendario: calendario , row_number:row_number}));
    
    console.log(`Agendas realizadas:${ listParse } `)

    await globalState.update({Lastservices:listParse})

    if (listParse.length <=0){
        /********************************************
         * NO TIENE ANGENDAS NINGUNA SESION ES NUEVO
         *******************************************
         */
         return gotoFlow(flowIsNowClient) 
    }
    else 
    {
        /*************************************
         * ES CLIENTE O YA AGENDO ALGUNA VEZ
         ************************************
         */
         return gotoFlow(flowthisClient) 
        }
        
})

export { flowServicios }

