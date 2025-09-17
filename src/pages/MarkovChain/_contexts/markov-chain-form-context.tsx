import { createFormContext } from '@mantine/form';

interface MarkovChainFormValues {
    states: string[];
    initialStateDistribution: number[];
    transitionMatrix: number[][];
    sequenceLength: number;
    solveIterations: boolean;
    solveSteadyState: boolean;
    iterationCount: number;
}

export const [MarkovChainFormProvider, useMarkovChainFormContext, useMarkovChainForm] =
    createFormContext<MarkovChainFormValues>();