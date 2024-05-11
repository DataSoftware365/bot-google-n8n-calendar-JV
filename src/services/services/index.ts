import { N8N_GET_FROM_SERVICIOS } from 'src/config'

/**
 * get registers services to bussines
 * @returns 
 */
const ListServices = async (): Promise<{servicio:string, profesional:string, duracion: number, precio: number , calendario: string }[]> => {
    const dataServices = await fetch(N8N_GET_FROM_SERVICIOS)
    const json: {servicio:string, profesional:string, duracion: number, precio: number , calendario: string }[] = await dataServices.json()
   
    const list = json.reduce((prev, current) => {prev.push({
                  servicio: current.servicio , 
                  profesional: current.profesional,
                  duracion: current.duracion,
                  precio: current.precio,
                  calendario: current.calendario})

                  console.log(`prev:${prev}`)
                return prev},
                 [])
  

    console.log(`list:${json}`)
    
    return json
}

export { ListServices }
 