import type { Pattern } from '../../types';
import { meetingRooms } from './meeting-rooms';
import { mergeIntervalsProblem } from './merge-intervals-p';

export const mergeIntervals: Pattern = {
  id: 'merge-intervals',
  group: 'Arrays',
  order: 3,
  title: { en: 'Merge Intervals', es: 'Merge Intervals (fusionar intervalos)' },
  tagline: { en: 'Sort ranges by where they start; then overlaps can only happen between neighbours.', es: 'Ordena los rangos por donde empiezan; así los solapamientos solo pueden ocurrir entre vecinos.' },
  cues: [
    { en: 'gives **intervals / ranges**: `[start, end]` pairs, meetings, bookings, time slots, line segments', es: 'da **intervalos / rangos**: pares `[start, end]`, reuniones, reservas, franjas horarias, segmentos de recta' },
    { en: 'asks to **merge**, **insert**, find **overlaps / conflicts**, or find free gaps', es: 'pide **fusionar**, **insertar**, encontrar **solapamientos / conflictos** o encontrar huecos libres' },
    { en: 'asks for the minimum number of rooms / platforms / resources needed at once', es: 'pide el número mínimo de salas / andenes / recursos necesarios a la vez' },
  ],
  model: [
    { en: 'Two intervals `a` and `b` overlap exactly when each one starts before the other ends: `a.start <= b.end` and `b.start <= a.end`. Memorise that single line; the six possible pictures (a before b, a inside b, …) all reduce to it.', es: 'Dos intervalos `a` y `b` se solapan exactamente cuando cada uno empieza antes de que termine el otro: `a.start <= b.end` y `b.start <= a.end`. Memoriza esa única línea; los seis dibujos posibles (a antes de b, a dentro de b, …) se reducen todos a ella.' },
    { en: 'Checking every pair costs O(n²). The pattern is to **sort by start time first**. Walking left to right, you keep one "current" interval. The next interval either starts inside it (overlap → stretch the current end if needed) or starts after it ends (gap → the current interval is final, begin a new one).', es: 'Revisar cada par cuesta O(n²). El patrón es **ordenar primero por inicio**. Recorriendo de izquierda a derecha, mantienes un intervalo "actual". El siguiente intervalo o bien empieza dentro de él (solapamiento → estira el final actual si hace falta) o bien empieza después de que termina (hueco → el intervalo actual es definitivo, empieza uno nuevo).' },
    { en: 'Why is one comparison enough? Because of the sort: if the next interval does not reach the current one, no later interval can either — they all start even later.', es: '¿Por qué basta una comparación? Por el ordenamiento: si el siguiente intervalo no alcanza al actual, ningún intervalo posterior puede hacerlo, porque todos empiezan todavía más tarde.' },
    { en: 'Variants: to *count* how many overlap at once (meeting rooms needed), sort and use a min-heap of end times, or sweep through start and end events in order.', es: 'Variantes: para *contar* cuántos se solapan a la vez (salas de reuniones necesarias), ordena y usa un montículo (heap) mínimo de tiempos de fin, o recorre en orden los eventos de inicio y fin.' },
  ],
  template: `sort intervals by start
merged = []
for cur in intervals:
    if merged is empty or cur.start > merged.last.end:
        merged.add(cur)                               # gap
    else:
        merged.last.end = max(merged.last.end, cur.end)   # overlap`,
  problems: [mergeIntervalsProblem, meetingRooms],
  quiz: [
    { q: { en: 'Given a list of employee calendars with busy time slots, find the time slots when everyone is free.', es: 'Dada una lista de calendarios de empleados con franjas ocupadas, encuentra las franjas en que todos están libres.' }, why: { en: 'Busy slots are intervals: sort and merge them; the gaps between merged intervals are the free time.', es: 'Las franjas ocupadas son intervalos: ordénalos y fusiónalos; los huecos entre los intervalos fusionados son el tiempo libre.' } },
    { q: { en: 'Given a sorted list of non-overlapping intervals, insert a new interval and merge if necessary.', es: 'Dada una lista ordenada de intervalos que no se solapan, inserta un intervalo nuevo y fusiona si es necesario.' }, why: { en: 'Intervals + merge on overlap — the merge-intervals sweep.', es: 'Intervalos + fusionar al solaparse: el barrido de fusión de intervalos.' } },
  ],
};
