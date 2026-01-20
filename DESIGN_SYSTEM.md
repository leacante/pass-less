# 🎨 Sistema de Diseño Pass-Less

Inspirado en **blocks.css** y **codeframe.co**, este sistema de diseño abraza una estética **artesanal, indie y hacker-friendly**.

## 🎯 Filosofía

- **Simple y funcional**: Sin artificios innecesarios
- **Tangible**: Todo se siente como bloques físicos
- **Personalidad**: Evita diseños corporativos genéricos
- **Feedback inmediato**: Interacciones mecánicas y claras

## 🎨 Paleta de Colores

### Fondos
```css
--bg-paper: #fafafa      /* Fondo general */
--bg-white: #ffffff      /* Bloques principales */
--bg-mint: #d4f4dd       /* Acciones positivas */
--bg-green: #b8e6c4      /* Separadores */
--bg-yellow: #fff9c4     /* Advertencias/destructivas */
--bg-blue: #dbeafe       /* Estados editando */
--bg-gray: #f5f5f5       /* Hover sutiles */
```

### Texto
```css
--text-primary: #1a1a1a    /* Texto principal */
--text-secondary: #525252  /* Texto secundario */
--text-muted: #737373      /* Texto deshabilitado */
```

### Acentos
```css
--accent-green: #4ade80    /* Principal/éxito */
--accent-mint: #6ee7b7     /* Focus states */
--accent-blue: #60a5fa     /* Información */
--accent-red: #ef4444      /* Peligro */
--accent-yellow: #fbbf24   /* Advertencia */
```

## 🧱 Componentes Base

### Blocks
Los bloques son la unidad fundamental del diseño.

```css
.block {
  background: var(--bg-white);
  border: 3px solid #1a1a1a;
  border-radius: 4px;
  box-shadow: 4px 4px 0 #1a1a1a;  /* Sombra dura, sin blur */
  padding: 24px;
}

.block:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 #1a1a1a;
}
```

### Botones
Botones grandes, rectangulares con sombra desplazada.

```html
<button class="btn btn-primary">
  Acción Principal
</button>

<button class="btn btn-secondary">
  Acción Secundaria
</button>
```

**Comportamiento hover:**
- Se "levantan" visualmente: `translate(-2px, -2px)`
- La sombra aumenta
- Al hacer click, se "hunden": `translate(2px, 2px)`

### Inputs
Inputs con borde visible y foco marcado.

```html
<input class="input" type="text" placeholder="Email..." />
```

**Focus state:**
- Sombra tipo "glow" usando `box-shadow` sin blur
- Color mint para indicar foco activo

## 📐 Espaciado

```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

## 🎭 Interacciones

### Hover
- Pequeño desplazamiento: `translate(-1px, -1px)` o `translate(-2px, -2px)`
- Aumento de sombra
- Cambio de color de fondo en elementos sutiles

### Active/Click
- "Hundimiento" del elemento: `translate(2px, 2px)`
- Sombra desaparece: `box-shadow: 0 0 0`

### Transiciones
- Rápidas y mecánicas: `50ms`
- Sin easing complejo
- Feedback inmediato

## 🚫 Anti-patrones (Lo que NO hacemos)

- ❌ NO gradientes
- ❌ NO glassmorphism
- ❌ NO sombras difusas (blur)
- ❌ NO animaciones suaves tipo ease-in-out
- ❌ NO diseño corporativo/empresarial
- ❌ NO bibliotecas como Material UI, Bootstrap, Tailwind

## 🎯 Ejemplos de Uso

### Card con hover
```html
<div class="block">
  <h3>Título del bloque</h3>
  <p>Contenido...</p>
</div>
```

### Botón de acción
```html
<button class="btn btn-primary">
  <svg>...</svg>
  Nueva Contraseña
</button>
```

### Input con focus
```html
<input 
  class="input" 
  type="email" 
  placeholder="tu@email.com"
/>
```

## 🎨 Tipografía

- **Font stack**: System fonts (Segoe UI, San Francisco, etc.)
- **Font mono**: Courier New para passwords
- **Peso**: 600-800 para títulos, 400 para texto
- **Sin antialiasing fancy**: Texto sólido y claro

## 📱 Responsive

El diseño se adapta pero mantiene su carácter:
- Mobile: Stack vertical, botones grandes
- Desktop: Layout de dos columnas, más espaciado
- Siempre mantiene los bordes gruesos y sombras duras

## 🛠️ Desarrollo

### Clase Base Reutilizables
- `.btn` - Botones
- `.block` - Contenedores con sombra
- `.input` - Campos de entrada
- `.select` - Dropdowns
- `.stack` - Layout vertical
- `.row` - Layout horizontal

### Modificadores
- `.btn-primary` - Verde brillante
- `.btn-danger` - Rojo para acciones destructivas
- `.btn-small` - Versión compacta
- `.block-flat` - Sin sombra
- `.block-mint` - Fondo mint

## 💡 Inspiración

Este sistema se inspira en:
- [blocks.css](https://thesephist.github.io/blocks.css/) - Sistema de bloques minimalista
- [codeframe.co](https://codeframe.co/) - Estética indie/artesanal
- Herramientas indie bien diseñadas
- Estética "brutalist" web design

## 📚 Recursos

- Variables CSS en `/src/app/globals.css`
- Componentes reutilizables en `/src/components/`
- Sin dependencias de UI frameworks externos

---

**Resultado:** Una interfaz que se siente tangible, honesta y con personalidad. Cada interacción es clara y satisfactoria.
