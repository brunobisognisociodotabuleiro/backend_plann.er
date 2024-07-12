import type { FastifyInstance }  from 'fastify';
import type { ZodTypeProvider} from "fastify-type-provider-zod";
import { z } from 'zod';
import { prisma } from '../lib/prisma';







export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trips/:tripId/confirm', 
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(), 
        }),
      },
    }, 
    async (resquest) => {
      const {tripId} = resquest.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId, 
        }
      })
        if (!trip) {
          throw new Error('Viagem não encontrada')
        }

        if (trip.is_confirmed) {
          throw new Error('Viagem já confirmada')
        } 

        if (trip.is_confirmed){
          return reply.redirect(`htpps://localhost:3333/trip/${tripId}`)
        }

        return { tripId: resquest.params.tripId}
    }
        
  )
}
