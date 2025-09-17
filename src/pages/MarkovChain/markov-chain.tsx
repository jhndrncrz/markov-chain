import { useState } from 'react';
import { Stepper, Button, Group, Stack, Title, Card } from '@mantine/core';
import { Step1 } from './_components/step-1';
import { Step2 } from './_components/step-2';
import { Step3 } from './_components/step-3';
import { StepFinal } from './_components/step-final';
import { MarkovChainFormProvider, useMarkovChainForm } from './_contexts/markov-chain-form-context';
import { IconList, IconTransitionLeft, IconNumbers, IconCheck } from '@tabler/icons-react';

export function MarkovChain() {
  const [active, setActive] = useState(0);

  const form = useMarkovChainForm({
    mode: 'controlled',
    initialValues: {
      states: [],
      initialStateDistribution: [],
      transitionMatrix: [],
      sequenceLength: 10,
      solveIterations: true,
      solveSteadyState: false,
      iterationCount: 10,
    },

    validate: (values) => {
      if (active === 0) {
        return {
          states: values.states.length < 1 ? 'At least one state is required' : null
        };
      }

      if (active === 1) {
        const matrix = values.transitionMatrix;
        const numStates = values.states.length;

        if (matrix.length !== numStates) {
          return { transitionMatrix: 'Transition matrix must have the same number of rows as states' };
        }

        for (let i = 0; i < numStates; i++) {
          if (matrix[i].length !== numStates) {
            return { transitionMatrix: 'Transition matrix must have the same number of columns as states' };
          }

          // Check if row sums to 1
          const rowSum = matrix[i].reduce((sum, val) => sum + (val || 0), 0);
          if (Math.abs(rowSum - 1) > 0.001) {
            return { transitionMatrix: `Row ${i + 1} (${values.states[i]}) must sum to 1.0 (currently ${rowSum.toFixed(3)})` };
          }
        }
      }

      if (active === 2) {
        // Validate initial state probabilities
        const initialStateSum = values.initialStateDistribution.reduce((sum, val) => sum + (val || 0), 0);
        if (Math.abs(initialStateSum - 1) > 0.001) {
          return { initialStateDistribution: `Initial state probabilities must sum to 1.0 (currently ${initialStateSum.toFixed(3)})` };
        }

        // Validate that at least one analysis type is selected
        if (!values.solveIterations && !values.solveSteadyState) {
          return { solveIterations: 'Please select at least one analysis type' };
        }

        // Validate iteration count if iterations analysis is selected
        if (values.solveIterations) {
          if (values.iterationCount < 1) {
            return { iterationCount: 'Number of iterations must be at least 1' };
          }
          if (values.iterationCount > 1000) {
            return { iterationCount: 'Number of iterations cannot exceed 1000' };
          }
        }
      }

      return {};
    },
  });

  const restartProcess = () => {
    form.reset();
    setActive(0);
  };

  const steps = [{
    label: 'Step 1',
    description: 'Define the number of states',
    Component: Step1,
  }, {
    label: 'Step 2',
    description: 'Define the transition probabilities',
    Component: Step2,
  }, {
    label: 'Step 3',
    description: 'Configure solution parameters',
    Component: Step3,
  }, {
    label: 'Final Step',
    description: 'Review and submit',
    Component: (props: any) => <StepFinal {...props} onRestart={restartProcess} setActive={setActive} />,
  }];

  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      return current < steps.length - 1 ? current + 1 : current;
    });

  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  // Step icons
  const stepIcons = [
    <IconList size={20} />,
    <IconTransitionLeft size={20} />,
    <IconNumbers size={20} />,
    <IconCheck size={20} />,
  ];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <Stack style={{ width: '100%'  }}>
        <Title order={2} ta="center" mb="md">
          Markov Chain Solver
        </Title>
        <Card 
          shadow="sm"
          
        >
          <MarkovChainFormProvider form={form}>
            <Stepper active={active} size="md" radius="xl">
              {steps.map((step, index) => (
                <Stepper.Step
                  key={index}
                  icon={stepIcons[index]}
                  label={step.label}
                  description={step.description}
                >
                  <step.Component />
                </Stepper.Step>
              ))}
            </Stepper>
          </MarkovChainFormProvider>

          <Group justify="flex-end" mt="xl">
            {active !== 0 && (
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
            )}
            {active !== 3 && <Button onClick={nextStep}>Next step</Button>}
          </Group>
        </Card>
      </Stack>
    </div>
  );
}