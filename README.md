# Liquid Glass Web Component (Vanilla JavaScript)

This is a small **Vanilla JavaScript Web Component** that simulates a **Liquid Glass** distortion effect.  
It includes several configuration options such as depth, chromatic aberration, size, shape, and other parameters inspired by how the effect behaves in real life. It is not perfect, but it aims to get reasonably close.

One nice thing about this component is that it’s written in plain Web Component standards, so you can use it in any environment, frameworks, no frameworks, anywhere you need it.

The component also includes a simple fallback for browsers that don’t support the technologies used (mainly SVG Filters), so it degrades gracefully instead of breaking.

## Background

This work is based on a React component I found in an article.  
https://medium.com/ekino-france/liquid-glass-in-css-and-svg-839985fcb88d

What I did was mainly translate that idea into a Vanilla Web Component, and then added some small improvements, configuration options, and a more flexible structure.  
It’s simply meant to be a small contribution for whoever finds it useful.

## Usage

Usage is straightforward:  
You only need to include the two JavaScript files with `<script>` tags in your HTML, and then you can use the component directly.

```html
<script src="displacement-utils.js"></script>
<script src="glass-element.js"></script>

<glass-element
    onclick="console.log('hello world')"
    style="z-index:10; --glass-padding: 32px;"
    width="48"
    height="48"
    radius="32"
    depth="5"
    blur="1"
    strength="40"
    background-color="rgba(255,255,255,0.4)"
    chromatic-aberration="2">
    <!-- Content -->
    <div>
        ⭐
    </div>
</glass-element>
```
