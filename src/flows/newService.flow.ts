import { addKeyword, EVENTS,utils } from "@builderbot/bot";
import { flowProfessional } from "./professional.flow";
import { flowSchedule } from "./schedule.flow";
import { getHistoryParse, handleHistory } from "../utils/handleHistory";

export interface Comment {
    servicio;
    profesionales;
    calendario;    
 }

const flowNewService = addKeyword(EVENTS.ACTION).addAction(async (_, {state, globalState , flowDynamic  }) => {
            const palabrasClave = globalState.get('servicios')
            await flowDynamic([`Gracias ${state.get('name')} estos son nuestros servicios`,
                            `*${palabrasClave}*`,
                            '¿Que servicio deseas agendar?',
                            'Si son varios separa por una coma'])
})
.addAction({ capture: true }, async (ctx, { state , globalState, fallBack , gotoFlow ,flowDynamic }) => {
            
    const palabrasClave = globalState.get('servicios')
    
    const listaservicios = globalState.get('listaservicios')
    .map(({servicio,profesional,duracion,precio,calendario}) => ({servicio:servicio,profesional:profesional,duracion:duracion,precio:precio,calendario:calendario}));
    
    console.log(`listaservicios:${listaservicios}`)
    console.log(`palabrasClave:${palabrasClave}`)

    //Mirar si llevan una coma o una y o son mas de uno sera la duracion la suma de ambos
    //si cada servicio lo realiza un profesional no agendar excepto si todo lo hace el mismo
    //correo al gerente o manager?
    //si es el mismo pues listo agendamos
    
    let valueText = ctx.body.replace(/y/i, ",").replace(/ /g, "")
    let newArr=valueText.split(",")
    
    if(newArr.length==0){
        //algo fallo extrayendo datos
        return fallBack(`Upps!! ,repiteme los servicios por favor bien escritos`)

    }else if(newArr.length ===1)
    {
        //Solo va un servicio
        //vamos a por el profesional que realiza el servicio
        if(palabrasClave.includes(ctx.body.toLocaleLowerCase())){
            state.update({ servicio:ctx.body , profesional:''}) 
            return gotoFlow(flowProfessional)
        } 
        else 
        {
            return fallBack(`Debes de seleccionar un servicio valido!!`)
        }        
        
    }else if(newArr.length > 1)
    {
        //hay mas de un servicio
        //mirar si los servicios lo hace el mismo pro vale
        //si no pues agrupr los del mismo pro y despues nada
        const totduracion=0
        let myArray = [];
        //extraer los servicos para agrupar por porfesional
        for (var i = 0; i < newArr.length; i++) {     
            newArr[i].replace(/ /g, "")  
            console.log(`Servicio ${newArr[i].toLocaleLowerCase()}`)    
            const listaProfesionales = listaservicios.filter(function (serviciosolicitado) {
                    return (serviciosolicitado.servicio.toLocaleLowerCase().includes(newArr[i].toLocaleLowerCase()))
                })  
           
            const profesionales=listaProfesionales.map((i) =>i.profesional.split(' ').shift())
            console.log(profesionales)
            let commentData = {} as Comment;
            commentData.servicio=newArr[i]
            commentData.profesionales=profesionales
            myArray.push(commentData)
                        
        }
        //console.log(myArray)
        let ocurrencias = 1
        let nameservicios=[]
        nameservicios.push(myArray[0].servicio)
        //ver si es posible agrupar en uno solo si no que agende por separado
        let namerecursivo=""
        for (var i = 0; i < myArray[0].profesionales.length; i++) {
            //console.log(`Profesionales: ${myArray[0].profesionales[i]}`)  
            for (var u = 1; u < myArray.length; u++) {
                for (var e = 0; e < myArray[u].profesionales.length; e++) {
                    let namepro=myArray[u].profesionales[e]
                    if(namepro.toLocaleLowerCase()===myArray[0].profesionales[i].toLocaleLowerCase()){
                        ocurrencias=ocurrencias+1
                        namerecursivo=namepro
                        nameservicios.push(myArray[u].servicio)
                        //console.log(namepro)        
                        //console.log(`Servicio:${myArray[u].servicio}`)
                    }                     
                }
            }
        }
        console.log(`ocurrencias:${ocurrencias}`)
        console.log(`namerecursivo :${namerecursivo}`)
        console.log(`nameservicios:${nameservicios.toString()}`)
        console.log(`Registros:${myArray.length}`)
        
        //ver como a acontecido las concurencias
        if(ocurrencias<myArray.length){
            if(namerecursivo!=''){
                //console.log(`hay recursivos servicios de ${namerecursivo} como son ${nameservicios.toString()} pero otros no mejor realiza de nuevo con solo estos servicos y los otros por separado`)
                return fallBack(`hay recursivos servicios de ${namerecursivo} como son 
                                ${nameservicios.toString()} 
                                pero otros no mejor realiza de nuevo 
                                con solo estos servicos y los otros por separado`)
            }  
            if(namerecursivo===''){
                //console.log(`Los servicios que has pedido son de diferentes profesionales y no podra ser posible agendar juntos reintenta por separado`)
                return fallBack(`Los servicios que has pedido son de 
                    diferentes profesionales y no podra ser posible agendar juntos reintenta por separado`)
            }   
        }

        //SON TODOS DEL MISMO PROFESIONAL
        
        if(ocurrencias===myArray.length){
            if(namerecursivo!=''){
            console.log(`vamos a sacar la duracion y sumarla`)
                let duracion_unida=0
                let calendariopro=""
                const listaDeServicios = globalState.get('listaservicios')
                //BUSCAR LA DURACION AGRUPADA
                for (var u = 0; u < nameservicios.length; u++) {
                    let serviciounico=nameservicios[u]
                    const findElement=listaDeServicios.findIndex(
                            element => element.servicio.toLocaleLowerCase().includes(serviciounico.toLocaleLowerCase()) &&
                            element.profesional.toLocaleLowerCase() === namerecursivo.toLocaleLowerCase() ) ?? -1;
                    console.log(`findelement:${findElement}`)
                    if (findElement>=0){
                            duracion_unida=duracion_unida+listaDeServicios[findElement].duracion
                            calendariopro=listaDeServicios[findElement].calendario
                    }
                    else
                    {
                        //NO DEBERIA DE PASAR ESTA TODO BIEN PERO PUSO UN QUE NO ERA DE LA lista???
                        return fallBack('Lo escrito no es un profesional valido para el servicios.Reintenta')
                    }     
                }
                //GUARDAR VALORES PARA AGENDAR YA
                
                console.log(`servicios:${nameservicios.toString()}`)
                console.log(`profesional elegido:${namerecursivo}`)
                console.log(`duracion unida:${duracion_unida}`)
                console.log(`calendario profesional:${calendariopro}`)

                await state.update({servicio:nameservicios.toString()}) 
                await state.update({profesional:namerecursivo})
                await state.update({duracion:duracion_unida})
                await state.update({calendario:calendariopro})

                //ir a shedule directo sinpasar por porfesionales
               
            }
            if(namerecursivo===''){
                //console.log(`Los servicios que has pedido son de diferentes profesionales y no podra ser posible agendar juntos reintenta por separado`)
                return fallBack(`Los servicios que has pedido son de diferentes 
                                profesionales y no podra ser 
                                posible agendar juntos reintenta por separado`)
            }


    
        
        await flowDynamic("Perfecto!! vamos con la fecha ¿Que dia y hora te viene bien para esto?")
        }                     
    }
})
.addAction({ capture: true }, async (ctx, { state, gotoFlow }) => {  
    
    const history = getHistoryParse(state)
    return gotoFlow(flowSchedule) 
})      
export {flowNewService}