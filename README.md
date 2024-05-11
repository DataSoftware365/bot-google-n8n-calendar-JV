[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/ApzZZF?referralCode=jyd_0y)

- Use [ChatPDF](https://www.chatpdf.com/) and API [documentation](https://www.chatpdf.com/docs/api/backend)
- Use [n8nTemplates](/n8n/templates)


Boot desarrollado con la librería builderboot en TypeScript.
-1 Necesita de credenciales para poder usar el calendar y Google Drive y sheet añadir apis de calendar y sheet
 Scopes necesarios
#calendar
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events.readonly

#sheets
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/spreadsheets


#drive
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/drive.appdata
https://www.googleapis.com/auth/drive.photos.readonly

scopes de n8n para ajustar mas
https://docs.n8n.io/integrations/builtin/credentials/google/oauth-generic/#scopes

2-necesario crear 1 credenciales oAuth con la misma credencial dar a las API de clandar y sheet en el n8n 
debes de crear 2 una de cada tipo la misma no vale pero si los datos de conexión

3-crear en n8n los workflows
-	n8n_add_to_calendar-v3-calendarId-addtoSheet (añade al calendario y al sheet)
-	n8n-get_servicios_endpoint(devuele un json con las estructuras correctas de los servicios/profesionales de la hoja servicios de la  sheet arreglando el json)
-	n8n_get_to_calendar-v3-calendarId(recuperas las agendas del calendario)
-	n8n-get-servicesClientV3(recupera de la sheet las agendas del cliente según el pone para saber si ya es cliente o no y para cancelar agendas o reagendar)
-	n8n-post-delete-event-calendar_v3-eventid(para eliminar las agendas y además en un trigger elimina de la hoja sheet el  servicio también)

4 crear el .env
 esta variable y su codigo ahora no se usa pero si quieres que añada los datos del usuario cuando se conecta por primera vez antes
 de nada puedes usar, preferimoq ue lo aga si agenda si no no pero si queremos hacer seguimientos de los que noa gendaron esto 
 esta para eso ya que crea un registro en database solo con los datos de name,email,start,end(vacios),phone,servicio(noname),profesiona(noname),duracion(0),calendar(noname)

5-crear una sheet de nombre database con dos hojas
Citas_Clientes
nombre	email	start	end	phone	servicio	profesional	idevent	calendario																	
Servicios
fila 1
servicios profesional duracion precio calendario la duracion solo numeros