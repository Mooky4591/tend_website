---
name: DashboardCharts.test
description: Tests for app/dashboard/DashboardCharts — renders without crashing with empty or populated data, and displays section labels
type: project
---

# AI Contract: __tests__/DashboardCharts.test.tsx

## Purpose
Unit tests for `app/dashboard/DashboardCharts.tsx`. Verifies the component renders under all prop conditions and that the expected section labels appear in the DOM. Recharts internals are mocked — chart visual correctness is not tested here.

## Allowed Responsibilities
- Mock `recharts` to replace all chart primitives with lightweight DOM stubs.
- Assert that both chart section labels ("Homeowners over time", "Messages per month") render.
- Assert that the line chart and bar chart stubs appear in the DOM.
- Test with both empty arrays and populated `ChartPoint[]` data.

## Not Allowed
- Do not make real network requests or read from Supabase.
- Do not test recharts rendering logic or SVG output.
- Do not test data transformation — that is the responsibility of `DashboardPage`.

## Public Interfaces
- No exports — test file only.

## Mock Targets
- `recharts` — `ResponsiveContainer`, `LineChart`, `BarChart`, `Line`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip` all replaced with lightweight stubs; `LineChart` renders `data-testid="line-chart"`, `BarChart` renders `data-testid="bar-chart"`

## Tests Required
- Renders without crashing when passed empty arrays for both props.
- Renders without crashing when passed populated `ChartPoint[]` data.
- Displays the "Homeowners over time" section label.
- Displays the "Messages per month" section label.
