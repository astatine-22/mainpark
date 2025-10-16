'use server';
/**
 * @fileOverview Predicts parking occupancy based on historical data and current trends.
 *
 * - predictParkingOccupancy - A function that handles the parking occupancy prediction process.
 * - PredictParkingOccupancyInput - The input type for the predictParkingOccupancy function.
 * - PredictParkingOccupancyOutput - The return type for the predictParkingOccupancy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictParkingOccupancyInputSchema = z.object({
  parkingLotId: z.string().describe('The ID of the parking lot to predict occupancy for.'),
  dateTime: z.string().describe('The date and time to predict occupancy for (ISO format).'),
});
export type PredictParkingOccupancyInput = z.infer<typeof PredictParkingOccupancyInputSchema>;

const PredictParkingOccupancyOutputSchema = z.object({
  predictedOccupancy: z
    .number()
    .describe(
      'The predicted occupancy as a percentage (0-100).  For example, an output of 75 means the parking lot is predicted to be 75% full.'
    ),
  reason: z.string().describe('The reason for the predicted occupancy.'),
});
export type PredictParkingOccupancyOutput = z.infer<typeof PredictParkingOccupancyOutputSchema>;

export async function predictParkingOccupancy(
  input: PredictParkingOccupancyInput
): Promise<PredictParkingOccupancyOutput> {
  return predictParkingOccupancyFlow(input);
}

const predictParkingOccupancyPrompt = ai.definePrompt({
  name: 'predictParkingOccupancyPrompt',
  input: {schema: PredictParkingOccupancyInputSchema},
  output: {schema: PredictParkingOccupancyOutputSchema},
  prompt: `You are an expert in predicting parking occupancy based on historical data and current trends.

You will be given the parking lot ID and the date and time to predict occupancy for.

Based on this information, predict the occupancy of the parking lot as a percentage (0-100) and provide a reason for your prediction.

Parking Lot ID: {{{parkingLotId}}}
Date and Time: {{{dateTime}}}

Output:
Predicted Occupancy: <predicted occupancy percentage>
Reason: <reason for prediction>`,
});

const predictParkingOccupancyFlow = ai.defineFlow(
  {
    name: 'predictParkingOccupancyFlow',
    inputSchema: PredictParkingOccupancyInputSchema,
    outputSchema: PredictParkingOccupancyOutputSchema,
  },
  async input => {
    const {output} = await predictParkingOccupancyPrompt(input);
    return output!;
  }
);
