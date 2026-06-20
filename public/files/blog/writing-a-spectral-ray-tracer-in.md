---
title: "Writing a Spectral Ray Tracer in Tomo"
date: "2025-12-17"
subtitle: "I recently wrote a spectral ray tracer in a programming language called Tomo. This was partly a rendering experiment, partly an excuse to bug Bruce, and partly a way to test whether Tomo could handle real systems-style work."
slug: "writing-a-spectral-ray-tracer-in"
---

I recently wrote a **[spectral ray tracer](https://github.com/andrewlidong/spectral-ray-tracer)** in a programming language called **[Tomo](https://tomo.bruce-hill.com/)**. This was partly a rendering experiment, partly an excuse to bug Bruce, and partly a way to test whether Tomo could handle real systems-style work.

It turns out it can… surprisingly well.

### Why Spectral Ray Tracing

Most ray tracers work in RGB: three color channels, fake dispersion and lots of approximiations. Spectral ray tracing is more literal… instead of tracing red, green, blue, you trace wavelengths of light and integrate them into color at the end. This lets you model stuff like chromatic dispersion correctly - blue light bends more than red in glass because that’s what how physics works.

It’s also computationally expensive and unforgiving of bugs, which makes it a good stress test.

### Why Tomo?

Because I felt like it.

But also, Tomo is a small, statically typed language that compiles to C. It’s designed to be safe, readable, and fast without the ceremony of C++ or the lifetime gymnastics of Rust. It feels like safe C with modern ergonomics.

This turned out to be nice for the ray tracer, as I was able to leverage:

-   tight numeric loops
    
-   lots of small structs
    
-   recursive path tracing
    
-   no dynamic frameworks or hidden runtime behavior
    

Tomo lets you write straightforward, math-heavy code and trust that it’ll compile to something efficient and predictable.

### The Project

The renderer traces light across 81 discrete wavelengths (380-780nm) instead of RGB. Each wavelength is refracted using a wavelength-dependent index of refraction, which produces real dispersion effects in glass. After tracing, the spectrum is converted to CIE XYZ and then to sRGB for display.

The architecture is pretty basic:

-   basic geometry
    
-   diffuse, metal, and dielectric (glass) materials
    
-   recursive path tracing
    
-   no BVH (yet)
    

### Lessons Learned

The project reinforces something that Bruce I think has been trying to get across to me for awhile: good languages shape good thinking. Tomo pushed me toward simple data structures, explicit control flow and honest performance tradeoffs - all of which map really well to rendering code.

It also reminded me of why I wanted to learn systems this year in the first place. There’s something very satisfying about building a physically grounded system from scratch and watching it converge toward reality.

Systems programming is fun folks. And it’s nice that languages like Tomo make it accessible.
