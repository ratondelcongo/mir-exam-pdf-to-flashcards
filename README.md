# MIR Flashcards

Aplicación web moderna para convertir PDFs de exámenes MIR en flashcards interactivos.

## 🚀 Características

- ✅ **100% Client-side**: Todo el procesamiento ocurre en el navegador, sin necesidad de backend
- ✅ **Procesamiento de PDFs**: Extracción automática de preguntas y alternativas
- ✅ **Reordenamiento inteligente**: La alternativa correcta siempre aparece primero para facilitar el estudio
- ✅ **Flashcards interactivos**: Navegación fluida con teclado y mouse
- ✅ **Persistencia local**: Los paquetes se guardan en IndexedDB para uso offline
- ✅ **Exportación a RemNote**: Formato compatible con RemNote para importación
- ✅ **Responsive**: Funciona en desktop y móvil
- ✅ **Dark mode ready**: Soporte para modo oscuro

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: Zustand
- **Persistencia**: IndexedDB (con idb)
- **PDF Processing**: PDF.js (pdfjs-dist)
- **Lenguaje**: TypeScript

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# El worker de PDF.js ya está incluido en public/pdf.worker.min.mjs
# Si necesitas actualizarlo:
# cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs

# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

**Nota:** El archivo `public/pdf.worker.min.mjs` es necesario para el procesamiento de PDFs y está incluido en el repositorio.

## 📖 Uso

### 1. Subir un PDF

1. Haz clic en "Nuevo PDF" o en "Subir PDF" en la página principal
2. Arrastra y suelta un PDF de examen MIR, o haz clic para seleccionar
3. Espera a que se procese (el progreso se muestra en tiempo real)
4. Una vez completado, verás el paquete en la lista principal

### 2. Estudiar con Flashcards

1. Haz clic en "Estudiar" en cualquier paquete
2. Lee la pregunta y las alternativas
3. Piensa en tu respuesta
4. Haz clic en "Revelar respuesta" (o presiona Espacio/Enter)
5. La alternativa correcta se resalta en verde con su comentario
6. Navega con los botones o las flechas del teclado (← →)
7. Opcional: Marca la pregunta como correcta/incorrecta

### 3. Exportar a RemNote

1. Haz clic en "Exportar" en cualquier paquete
2. Se descargará un archivo `.txt` con el formato RemNote
3. Importa este archivo en RemNote para continuar estudiando

## 📄 Formato del PDF

El PDF debe seguir este formato:

```
1. ¿Texto de la pregunta?
1. Primera alternativa
2. Segunda alternativa
3. Tercera alternativa
4. Cuarta alternativa
Respuesta correcta: 2
Comentario: Explicación de la respuesta correcta (opcional)

2. ¿Siguiente pregunta?
...
```

**Importante:**
- Las preguntas deben estar numeradas secuencialmente
- Cada pregunta debe tener exactamente 4 alternativas
- La línea "Respuesta correcta: X" debe estar presente (donde X es 1-4)
- Los comentarios son opcionales pero recomendados

## 🎯 Atajos de Teclado

Mientras estudias:
- `←` - Pregunta anterior
- `→` - Pregunta siguiente
- `Espacio` o `Enter` - Revelar/ocultar respuesta

## 🗂️ Estructura del Proyecto

```
src/
├── app/                      # Páginas Next.js
│   ├── page.tsx             # Home (lista de paquetes)
│   └── study/[id]/page.tsx  # Visor de flashcards
├── components/              # Componentes React
│   ├── ui/                  # shadcn/ui components
│   ├── pdf/                 # Upload components
│   ├── flashcards/          # Flashcard components
│   └── export/              # Export components
├── lib/                     # Lógica de negocio
│   ├── pdf/                 # Extracción y parsing de PDFs
│   ├── db/                  # IndexedDB operations
│   ├── store/               # Zustand store
│   └── export/              # RemNote export
├── types/                   # TypeScript types
└── hooks/                   # Custom React hooks
```

## 🔧 Configuración

La aplicación no requiere configuración especial. Todo funciona out-of-the-box.

### Límites

- **Tamaño máximo de PDF**: 50 MB
- **Almacenamiento**: ~50 MB en IndexedDB (depende del navegador)

## 🆚 Diferencias con el Sistema Legacy (Python)

### Ventajas de la versión web:

- ✅ No requiere instalar Python
- ✅ Funciona en cualquier dispositivo con navegador
- ✅ Interfaz visual moderna
- ✅ Flashcards interactivos para estudiar
- ✅ Persistencia de múltiples paquetes
- ✅ Navegación entre preguntas
- ✅ No requiere conexión a internet (después de la primera carga)

### Mantiene compatibilidad:

- ✅ Mismo algoritmo de parsing
- ✅ Mismo formato de salida RemNote
- ✅ Mismo reordenamiento de alternativas
- ✅ Mismos comentarios como sub-ítems

## 🐛 Solución de Problemas

### El PDF no se procesa correctamente

- Verifica que el PDF siga el formato esperado
- Asegúrate de que tenga preguntas numeradas y alternativas claras
- Revisa que cada pregunta tenga la línea "Respuesta correcta: X"

### Los paquetes no se guardan

- Verifica que tu navegador permita IndexedDB
- Comprueba que no estés en modo incógnito (tiene límites de almacenamiento)
- Revisa la consola del navegador para errores

### La exportación no funciona

- Asegúrate de que tu navegador permita descargas
- Si usas bloqueadores de pop-ups, desactívalos para este sitio

## 📝 Sistema Legacy

El sistema Python original está disponible en el directorio `legacy/` para referencia.

## 🙏 Créditos

- Sistema legacy Python original: base para el algoritmo de parsing
- PDF.js: Mozilla Foundation
- shadcn/ui: @shadcn
- Iconos: Lucide React
