# HTML

```html
<div>
    <svg width="{width+50}" height="{height+50}" style="border: 1px">
        <g transform="translate(25 25)" style="text-anchor: middle">
            <include template="Barra" data="{data}" />
        </g>
    </svg>
</div>
<div>
    <button onclick="{data.ordenaAsc()}">Crescente</button>
    <button onclick="{data.ordenaDesc()}">Descrescente</button>
    <button onclick="{data.ordenaOriginal()}">Original</button>
    <button onclick="{data.embaralha()}">Embaralha</button>
</div>
```

# Javascript

```javascript
var tag = redot.tag;

tag("div") 
(
    tag("svg", {width:"{width+50}", height:"{height+50}", style:"border: 1px"}) 
    (
        tag("g", {transform:"translate(25 25)", style:"text-anchor: middle"}) 
        (
            redot.include({template:"Barra", data:"{data}"})
        )
    )
);

tag("div") 
(
    tag("button", {onclick:"{data.ordenaAsc()}"}, "Crescente"),
    tag("button", {onclick:"{data.ordenaAsc()}"}, "Descrescente"),
    tag("button", {onclick:"{data.ordenaAsc()}"}, "Original"),
    tag("button", {onclick:"{data.ordenaAsc()}"}, "Crescente")
);
```
