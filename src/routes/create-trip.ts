import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import dayjs from "dayjs";
import { getMailClient } from "../lib/mail";
import nodemailer from 'nodemailer';



export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/trips', {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string().min(4),
        owner_email: z.string().email(),
      })
    }
  }, async (request, reply) => {
    const { destination, starts_at, ends_at, owner_name, owner_email } = request.body;

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
            create: {
              name: owner_name,
              email: owner_email,
            }
            }
          }
        
      })



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
          subject: 'Confirmacao de viagem',
          html: `<p>teste do envio de email</p>`
          
   
  
      })

      console.log( nodemailer.getTestMessageUrl(message))

      return { id: trip.id }
})
}