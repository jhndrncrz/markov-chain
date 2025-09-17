import { Stack, Text, Alert, Table, Card, Group, Badge, Accordion, ScrollArea, Button } from "@mantine/core";
import { useMarkovChainFormContext } from "../_contexts/markov-chain-form-context";
import { IconCheck, IconCalculator, IconInfinity, IconRefresh, IconChartLine, IconNetwork } from "@tabler/icons-react";
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Matrix } from 'ml-matrix';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

interface StepFinalProps {
    onRestart: () => void;
    setActive: (step: number) => void;
}

export function StepFinal({ onRestart }: StepFinalProps) {
    const form = useMarkovChainFormContext();
    const { states, transitionMatrix, initialStateDistribution, solveIterations, solveSteadyState, iterationCount } = form.values;
    const networkRef = useRef<HTMLDivElement>(null);

    // Calculate iterations if requested
    const iterationResults = [];
    if (solveIterations) {
        let currentDistribution = [...initialStateDistribution];
        iterationResults.push({
            step: 0,
            distribution: currentDistribution,
            equations: [] // No equations for initial state
        });

        for (let step = 1; step <= iterationCount; step++) {
            const nextDistribution = new Array(states.length).fill(0);
            const stepEquations = [];

            // Calculate each state using linear equations
            for (let j = 0; j < states.length; j++) {
                const terms = [];
                for (let i = 0; i < states.length; i++) {
                    if (transitionMatrix[i][j] > 0) {
                        terms.push(`(${transitionMatrix[i][j]})${states[i]}_{${step-1}}`);
                        nextDistribution[j] += currentDistribution[i] * transitionMatrix[i][j];
                    }
                }
                stepEquations.push({
                    state: states[j],
                    equation: terms.length > 0 ? terms.join(' + ') : '0',
                    result: nextDistribution[j]
                });
            }

            iterationResults.push({
                step,
                distribution: nextDistribution,
                equations: stepEquations
            });

            currentDistribution = nextDistribution;
        }
    }

    // Calculate steady state if requested
    let steadyState: number[] | null = null;
    let steadyStateEquations: string[] = [];
    let constraintEquation = '';
    if (solveSteadyState) {
        try {
            // Create the system of equations for steady state
            // For steady state: each state's value equals the sum of transitions into it
            steadyStateEquations = [];

            for (let j = 0; j < states.length; j++) {
                const terms = [];
                for (let i = 0; i < states.length; i++) {
                    if (transitionMatrix[i][j] > 0) {
                        terms.push(`(${transitionMatrix[i][j]})${states[i]}`);
                    }
                }
                steadyStateEquations.push(`${states[j]} = ${terms.length > 0 ? terms.join(' + ') : '0'}`);
            }

            // Add constraint equation
            constraintEquation = `${states.join(' + ')} = 1`;

            // Simple iterative method to find steady state
            // Start with uniform distribution and iterate until convergence
            let currentState = new Array(states.length).fill(1 / states.length);
            const tolerance = 1e-10;
            const maxIterations = 1000;

            for (let iter = 0; iter < maxIterations; iter++) {
                const nextState = new Array(states.length).fill(0);

                // Apply transition matrix: nextState = currentState * P
                for (let i = 0; i < states.length; i++) {
                    for (let j = 0; j < states.length; j++) {
                        nextState[j] += currentState[i] * transitionMatrix[i][j];
                    }
                }

                // Check for convergence
                const diff = nextState.reduce((sum, val, i) => sum + Math.abs(val - currentState[i]), 0);
                if (diff < tolerance) {
                    steadyState = nextState;
                    break;
                }

                currentState = nextState;
            }
        } catch (error) {
            console.error('Error calculating steady state:', error);
        }
    }

    // Format transition matrix for display
    const formatTransitionMatrix = () => {
        const rows = [];
        for (let i = 0; i < transitionMatrix.length; i++) {
            const row = transitionMatrix[i].map(val => val.toFixed(3));
            rows.push(row.join(' & '));
        }
        return `\\begin{bmatrix} ${rows.join(' \\\\ ')} \\end{bmatrix}`;
    };

    // Prepare data for line chart
    const lineChartData = iterationResults.map(result => {
        const dataPoint: any = { step: result.step };
        states.forEach((state, i) => {
            dataPoint[state] = result.distribution[i];
        });
        return dataPoint;
    });

    // Colors for each state line
    const stateColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

    // Network graph setup
    useEffect(() => {
        if (networkRef.current && states.length > 0) {
            // Create nodes data
            const nodesArray = states.map((state, i) => ({
                id: i,
                label: state,
                color: {
                    background: stateColors[i % stateColors.length],
                    border: '#000000'
                }
            }));

            // Create edges data
            const edgesArray: any[] = [];
            transitionMatrix.forEach((row, i) => {
                row.forEach((prob, j) => {
                    if (prob > 0) {
                        edgesArray.push({
                            id: `${i}-${j}`,
                            from: i,
                            to: j,
                            label: prob.toFixed(2),
                            arrows: 'to',
                            width: Math.max(1, prob * 5),
                            smooth: i === j ? { type: 'curvedCW', roundness: 0.2 } : false
                        });
                    }
                });
            });

            // Create DataSets
            const nodes = new DataSet(nodesArray);
            const edges = new DataSet(edgesArray);

            // Create network
            const data = { nodes, edges };
            const options = {
                layout: {
                    improvedLayout: false
                },
                physics: {
                    enabled: true,
                    stabilization: { iterations: 100 }
                },
                nodes: {
                    font: { size: 16, color: '#000000' },
                    size: 30
                },
                edges: {
                    font: { size: 12, color: '#000000', background: '#ffffff' },
                    arrows: { to: { scaleFactor: 1 } }
                }
            };

            new Network(networkRef.current, data, options);
        }
    }, [states, transitionMatrix]);

    return (
        <Stack gap="md">
            <Text fw={500} size="lg">Markov Chain Solution</Text>

            <Group justify="space-between" align="center">
                <Alert icon={<IconCheck size={16} />} color="green" variant="light" style={{ flex: 1 }}>
                    <Text size="sm">
                        <strong>Analysis Complete!</strong> Your Markov chain has been successfully analyzed using the configured parameters.
                    </Text>
                </Alert>
                <Button
                    leftSection={<IconRefresh size={16} />}
                    variant="outline"
                    color="red"
                    onClick={onRestart}
                >
                    Start Over
                </Button>
            </Group>

            {/* Network Graph */}
            <Card withBorder>
                <Group mb="md">
                    <IconNetwork size={20} />
                    <Text fw={500} size="md">Markov Chain Network</Text>
                </Group>
                <Text size="sm" mb="md" c="dimmed">
                    Visual representation of the Markov chain showing states and transition probabilities.
                    Edge thickness represents transition probability magnitude.
                </Text>
                <div
                    ref={networkRef}
                    style={{ height: '400px', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                />
            </Card>

            {/* System Overview */}
            <Card withBorder>
                <Text fw={500} size="md" mb="md">System Overview</Text>

                <Group mb="sm">
                    <Text size="sm"><strong>States:</strong> {states.join(', ')}</Text>
                </Group>

                <Text size="sm" mb="xs"><strong>Transition Matrix:</strong></Text>
                <ScrollArea>
                    <BlockMath math={`P = ${formatTransitionMatrix()}`} />
                </ScrollArea>

                <Text size="sm" mb="xs" mt="md"><strong>Initial State Distribution:</strong></Text>
                <Stack gap="xs">
                    {states.map((state, i) => (
                        <BlockMath key={state} math={`${state}_0 = ${initialStateDistribution[i].toFixed(3)}`} />
                    ))}
                </Stack>
            </Card>

            {/* Iteration Analysis */}
            {solveIterations && (
                <Card withBorder>
                    <Group mb="md">
                        <IconCalculator size={20} />
                        <Text fw={500} size="md">Iteration Analysis</Text>
                    </Group>

                    <Text size="sm" mb="md">
                        Computing state probabilities over {iterationCount} steps using linear equations.
                    </Text>

                    {/* Line Chart */}
                    <Card withBorder mb="md" p="md">
                        <Group mb="md">
                            <IconChartLine size={16} />
                            <Text fw={500} size="sm">State Probability Evolution</Text>
                        </Group>
                        <Text size="xs" c="dimmed" mb="md">
                            Interactive chart showing how state probabilities change over iterations
                        </Text>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="step" label={{ value: 'Iteration Step', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: 'Probability', angle: -90, position: 'insideLeft' }} />
                                <Tooltip
                                    formatter={(value: any, name: string) => [value.toFixed(4), name]}
                                    labelFormatter={(step) => `Step ${step}`}
                                />
                                <Legend />
                                {states.map((state, i) => (
                                    <Line
                                        key={state}
                                        type="monotone"
                                        dataKey={state}
                                        stroke={stateColors[i % stateColors.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    <Accordion variant="separated">
                        {iterationResults.map((result, index) => (
                            <Accordion.Item key={index} value={`step-${result.step}`}>
                                <Accordion.Control>
                                    <Group>
                                        <Text fw={500}>Step {result.step}</Text>
                                        <Group gap="xs">
                                            {states.map((state, i) => (
                                                <Badge key={state} variant="light" size="sm">
                                                    <InlineMath math={`${state}_{${result.step}}`} />: {result.distribution[i].toFixed(3)}
                                                </Badge>
                                            ))}
                                        </Group>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap="sm">
                                        {result.step === 0 ? (
                                            <Text size="sm" c="dimmed">Initial state distribution</Text>
                                        ) : (
                                            <>
                                                <Text size="sm" fw={500}>Linear Equations for Step {result.step}:</Text>
                                                <Stack gap="xs">
                                                    {result.equations.map((eq, i) => (
                                                        <BlockMath key={i} math={`${eq.state}_{${result.step}} = ${eq.equation} = ${eq.result.toFixed(3)}`} />
                                                    ))}
                                                </Stack>
                                            </>
                                        )}

                                        <Text size="sm" fw={500} mt="md">State Values:</Text>
                                        <Table striped>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    {states.map(state => (
                                                        <Table.Th key={state} ta="center">
                                                            <InlineMath math={`${state}_{${result.step}}`} />
                                                        </Table.Th>
                                                    ))}
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                <Table.Tr>
                                                    {result.distribution.map((prob, i) => (
                                                        <Table.Td key={i} ta="center">
                                                            <Badge variant="light" color="blue">
                                                                {prob.toFixed(4)}
                                                            </Badge>
                                                        </Table.Td>
                                                    ))}
                                                </Table.Tr>
                                            </Table.Tbody>
                                        </Table>
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Card>
            )}

            {/* Steady State Analysis */}
            {solveSteadyState && steadyState && (
                <Card withBorder>
                    <Group mb="md">
                        <IconInfinity size={20} />
                        <Text fw={500} size="md">Steady State Analysis</Text>
                    </Group>

                    <Text size="sm" mb="md">
                        Finding the long-term equilibrium distribution where each state's probability remains constant.
                    </Text>

                    <Stack gap="md">
                        <Text size="sm" fw={500}>System of Linear Equations:</Text>
                        <Text size="sm" c="dimmed">
                            For steady state, each state's value equals the sum of probabilities flowing into it:
                        </Text>

                        <Stack gap="xs">
                            {steadyStateEquations.map((equation, index) => (
                                <BlockMath key={index} math={equation} />
                            ))}
                        </Stack>

                        <Text size="sm" fw={500} mt="md">Constraint:</Text>
                        <BlockMath math={constraintEquation} />

                        <Text size="sm" fw={500} mt="md">Solution:</Text>
                        <Stack gap="xs">
                            {states.map((state, i) => (
                                <BlockMath key={state} math={`${state} = ${steadyState[i].toFixed(4)}`} />
                            ))}
                        </Stack>

                        <Table striped>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th ta="center">State</Table.Th>
                                    <Table.Th ta="center">Steady State Value</Table.Th>
                                    <Table.Th ta="center">Percentage</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {states.map((state, i) => (
                                    <Table.Tr key={state}>
                                        <Table.Td ta="center" fw={500}>
                                            <InlineMath math={state} />
                                        </Table.Td>
                                        <Table.Td ta="center">
                                            <Badge variant="light" color="green">
                                                {steadyState[i].toFixed(4)}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td ta="center">
                                            {(steadyState[i] * 100).toFixed(2)}%
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Stack>
                </Card>
            )}

            {!solveIterations && !solveSteadyState && (
                <Alert color="yellow" variant="light">
                    <Text size="sm">
                        No analysis types were selected. Please go back to Step 3 to choose either iteration analysis or steady-state analysis.
                    </Text>
                </Alert>
            )}
        </Stack>
    );
}