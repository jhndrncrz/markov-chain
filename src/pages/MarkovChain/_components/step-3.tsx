import { Stack, Text, Alert, Checkbox, NumberInput, Group, Table, Badge } from "@mantine/core";
import { useMarkovChainFormContext } from "../_contexts/markov-chain-form-context";
import { IconInfoCircle, IconTarget, IconInfinity } from "@tabler/icons-react";
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function Step3() {
    const form = useMarkovChainFormContext();
    const stateLabels = form.values.states;

    // Ensure initialStateDistribution is always the right length
    if (form.values.initialStateDistribution.length !== stateLabels.length) {
        form.setFieldValue('initialStateDistribution', Array(stateLabels.length).fill(0));
    }

    // Calculate sum of initial state probabilities
    const initialStateSum = form.values.initialStateDistribution.reduce((sum, val) => sum + (val || 0), 0);
    const isValidInitialState = Math.abs(initialStateSum - 1) <= 0.001;

    return (
        <Stack gap="md">
            <Text fw={500} size="lg">Step 3: Configure Solution Parameters</Text>

            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                <Text size="sm" mb="xs">
                    <strong>Configure your analysis:</strong>
                </Text>
                <Text size="sm" mb="xs">
                    • Set the initial state probabilities (must sum to 1.0)
                </Text>
                <Text size="sm" mb="xs">
                    • Choose which analysis types to perform
                </Text>
                <Text size="sm">
                    • You can select both iteration analysis and steady-state analysis
                </Text>
            </Alert>

            <Stack gap="md">
                <Text fw={500} size="md">Initial State Probabilities</Text>
                <Text size="sm" c="dimmed">
                    Enter the probability of starting in each state ({states.map((state, i) => (
                        <span key={state}>
                            <InlineMath math={`${state}_0`} />
                            {i < states.length - 1 ? ', ' : ''}
                        </span>
                    ))}). These must sum to 1.0.
                </Text>

                <Table striped highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th ta="center" bg="gray.1">
                                <Text fw={500} size="sm">State</Text>
                            </Table.Th>
                            <Table.Th ta="center" bg="blue.1">
                                <Text fw={500} size="sm">Initial Probability</Text>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {stateLabels.map((state, index) => (
                            <Table.Tr key={index}>
                                <Table.Td ta="center" bg="blue.1">
                                    <Text fw={500} size="sm">
                                        <InlineMath math={`${state}_0`} />
                                    </Text>
                                </Table.Td>
                                <Table.Td p="xs">
                                    <NumberInput
                                        value={form.values.initialStateDistribution[index] || 0}
                                        onChange={(value) => {
                                            const val = typeof value === 'number' ? value : 0;
                                            const distribution = [...form.values.initialStateDistribution];
                                            distribution[index] = val;
                                            form.setFieldValue('initialStateDistribution', distribution);
                                        }}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        decimalScale={3}
                                        size="xs"
                                        w="100%"
                                        styles={{
                                            input: {
                                                textAlign: 'center',
                                            },
                                        }}
                                        aria-label={`Initial probability for state ${state}`}
                                    />
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        <Table.Tr>
                            <Table.Td ta="center" bg="gray.1">
                                <Text fw={500} size="sm">Sum</Text>
                            </Table.Td>
                            <Table.Td ta="center">
                                <Badge
                                    color={isValidInitialState ? "green" : "red"}
                                    variant="light"
                                    size="sm"
                                >
                                    {initialStateSum.toFixed(3)}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>

                <Text fw={500} size="md" mt="md">Analysis Types</Text>
                <Text size="sm" c="dimmed">
                    Select which types of analysis you want to perform. You can choose both.
                </Text>

                <Stack gap="sm">
                    <Checkbox
                        checked={form.values.solveIterations}
                        onChange={(event) => form.setFieldValue('solveIterations', event.currentTarget.checked)}
                        label={
                            <Group gap="xs">
                                <IconTarget size={16} />
                                <Text size="sm">Specific Number of Iterations</Text>
                            </Group>
                        }
                        description="Track how probabilities change over a set number of steps"
                    />

                    {form.values.solveIterations && (
                        <NumberInput
                            label="Number of Iterations"
                            description="How many steps forward to simulate"
                            value={form.values.iterationCount}
                            onChange={(value) => form.setFieldValue('iterationCount', typeof value === 'number' ? value : 1)}
                            min={1}
                            max={1000}
                            step={1}
                            placeholder="Enter number of iterations"
                            w="50%"
                            ml="xl"
                        />
                    )}

                    <Checkbox
                        checked={form.values.solveSteadyState}
                        onChange={(event) => form.setFieldValue('solveSteadyState', event.currentTarget.checked)}
                        label={
                            <Group gap="xs">
                                <IconInfinity size={16} />
                                <Text size="sm">Long-term Steady State</Text>
                            </Group>
                        }
                        description="Find equilibrium probabilities after many iterations"
                    />
                </Stack>
            </Stack>
        </Stack>
    );
}