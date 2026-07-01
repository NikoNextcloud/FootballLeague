Pill-shaped filter toggle used in a row to switch between views (e.g. Всички / Предстоящи / Резултати).

```jsx
<ChipGroup>
  <Chip active={filter === "all"} onClick={() => setFilter("all")}>Всички</Chip>
  <Chip active={filter === "upcoming"} onClick={() => setFilter("upcoming")}>Предстоящи</Chip>
  <Chip active={filter === "results"} onClick={() => setFilter("results")}>Резултати</Chip>
</ChipGroup>
```

Variants: `active` swaps the chip to solid green with dark text; inactive chips are translucent glass. Never more than 3 chips per group in the source product.
