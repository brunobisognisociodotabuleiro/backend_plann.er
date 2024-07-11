import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br'
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer';
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(localizedFormat);




export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string().min(4),
        owner_email: z.string().email(),
        emalis_to_invite: z.array(z.string().email()),
      })
    }
  }, async (request, reply) => {
    const { destination, starts_at, ends_at, owner_name, owner_email, emalis_to_invite } = request.body;

    if (dayjs(starts_at).isBefore(new Date())){
      throw new Error('Data do inicio da viajem invalido')
    }

    if (dayjs(ends_at).isBefore(starts_at)){
      throw new Error('Data do fim da viajem invalido ')
    }

    
     const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
          participant:{
            createMany:{
              data: [
                {
                  name: owner_name, 
                  email: owner_email, 
                  is_owner: true,
                  is_confirmed: true
                },

                ...emalis_to_invite.map(email => {
                  return{email}
                })
              ],
            }
          }
        }
      })




      const formattedStartsAt = dayjs(starts_at).format('LL')
      const formattedEndsAt = dayjs(ends_at).format('LL')

      const confirmtionLink = 'http://localhost:3333/${trip.id}/confirm'



      const  mail = await getMailClient()

      const message =  await mail.sendMail({

          from : {
            name : 'Equipe de plann.er', 
            address:'bruno@sociodotabuleiro.fun', 
          }, 
          to: {
            name: owner_name,
            address: owner_email,
          },
          subject: `confirme sua viagem para ${destination} em ${formattedStartsAt}`,
          html: `<div style="font-family: sans-serif; font-size: 16px; color: #111;">
          <div>
           <p>Você solicitou uma viajem a ${destination}, <b>USA</b>
          nas datas de <b>${formattedStartsAt} e ${formattedEndsAt}.</b>
          para<a href="${confirmtionLink}">confirmar clique no link abaixo :</a>  
        </p>
          </div>

          `.trim()
          
      })

      console.log( nodemailer.getTestMessageUrl(message))

      return { id: trip.id }
})

}