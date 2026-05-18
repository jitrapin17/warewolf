# Project Rules — Warewolf

## Figma ↔ HTML (trigger: มี Figma URL, Figma→HTML, HTML→Figma, asset จาก Figma)

### ข้อจำกัดสำคัญ
- Figma REST API ไม่มี write endpoint — ต้องใช้ Figma Plugin รับ JSON payload เท่านั้น

### Figma → HTML
- **ชื่อไฟล์ HTML**: ใช้ชื่อ frame ใน Figma เป็นชื่อไฟล์ HTML (ตัวพิมพ์เล็ก, แทนช่องว่างด้วย `-`) เช่น frame ชื่อ `Role Reveal` → `role-reveal.html`
- ดึง design tokens เป็น CSS custom properties ก่อนเขียน CSS (`--color-*`, `--gradient-*`, `--text-*`, `--effect-*`)
- สี → `var(--figma-color-{ชื่อ style})` ห้าม hardcode hex
- Font/Size → `class="text-{ชื่อ style}"` ห้ามกำหนด font-size ตรง
- Spacing → `var(--figma-num-{ชื่อ})` ห้าม hardcode px
- รูป → `src="assets/{node-id}.png"` ห้ามใช้ URL ภายนอก
- รักษา node hierarchy ให้ตรง — sub-container ที่มี gap ต่างกันต้องแยกออกจากกัน
- ใช้ absolute positioning และ pixel offset ตรงตัวตาม Figma
- Icon ในปุ่มกำหนด pixel dimension ตาม Figma spec ห้าม `width: 100%`
- ทุก element → ติด `<!-- figma-node-id:{id} -->` เสมอ
- CSS effect ที่รองรับไม่ได้ → แจ้ง user เป็น list ก่อน

### HTML → Figma
- อ้างอิงทุกค่าจาก HTML เท่านั้น: สี, font, ขนาด, spacing, content
- ห้ามเพิ่ม decorative element หรือ creative fill ที่ไม่มีใน HTML
- div/section → FRAME, flex-direction:row → HORIZONTAL, column → VERTICAL
- สีใน inline style → resolve กับ Figma palette ก่อนเสมอ
- **Design system first ทุกครั้งที่ sync**: ก่อนสร้าง node ใด ๆ ต้อง inspect Figma file ปลายทางเพื่อหา variables, paint styles, text styles, effect styles, local components/component sets, และ existing instances ที่ match กับ HTML แล้วใช้ของเดิมให้มากที่สุดก่อน fallback เป็น primitive
- **Variable binding priority**: solid color ที่มี Figma variable ตรงกันต้อง bind variable กับ paint (`setBoundVariableForPaint`) ก่อนใช้ `fillStyleId`; ถ้าไม่มี variable ค่อยใช้ paint style; ถ้าไม่มีทั้งสองค่อย inline `node.fills`
- **Text/effect style priority**: text ที่ตรงกับ style ในไฟล์ต้องใช้ `textStyleId` และห้าม set font props หลังจากนั้น; shadow/effect ที่ตรงกับ style ในไฟล์ต้องใช้ `effectStyleId`
- **Component reuse priority**: UI ที่ structure/role ตรงกับ local component หรือ component set (เช่น icon button, button, card) ต้องใช้ instance จาก component นั้นก่อน ถ้าแก้ content ให้ตรง HTML ได้ผ่าน component properties หรือ nested text override ใน instance; ถ้าแก้ content ไม่ได้หรือทำให้ HTML content ผิดเท่านั้นจึง fallback เป็น primitive พร้อมบันทึกเหตุผลใน `change_summary.skipped`
- output change_summary JSON พร้อม node tree ทุกครั้ง
- `change_summary` ต้องรายงานทุกครั้งว่าใช้ `colorVariables`, `paintStyles`, `textStyles`, `effectStyles`, `components` อะไรบ้าง และรายการที่ skip พร้อมเหตุผล
- **Text gradient fill**: ต้อง set `t.fills` หลัง `t.characters` เสมอ — Figma จะ reset fill ถ้า set ก่อน characters
- **Gradient fillStyleId**: ก่อน sync ให้ดู CSS comment บนแต่ละ `--gradient-*` var ใน style.css — comment มักระบุ Figma style name ไว้แล้ว (เช่น `/* Woft/Gradient/BG Gradient */`). ลอง `gradByName[styleName]` ก่อนเสมอ — ถ้าเจอ style ให้ใช้ `fillStyleId`; ถ้าไม่เจอ fallback `lgr()` inline. angle อาจต่างเล็กน้อยจาก CSS deg ยอมรับได้เพื่อ design-system consistency. CSS var ที่ไม่มี style (ไม่มี comment หรือ comment บอก "no style") → inline lgr() เท่านั้น
- **textStyleId detachment**: ห้าม set property ที่เป็นส่วนหนึ่งของ textStyle (lineHeight, fontSize, fontName) หลัง `t.textStyleId` — Figma จะ null ทิ้ง textStyleId ทันที. Fix: `if(o.lh && !o.tsid) t.lineHeight = ...` (ข้าม lineHeight เมื่อใช้ tsid)
- **Screen height**: CSS `min-height` → หลัง af() set `scr.primaryAxisSizingMode='AUTO'` เพื่อ HUG จาก content จริง หลังสร้าง children ครบแล้ว `if(scr.height<844){scr.primaryAxisSizingMode='FIXED';scr.resize(390,844);}` — แต่ละหน้าอาจสูงไม่เท่ากัน ห้าม hardcode 844
- **Frame height guard**: CSS ที่ไม่มี fixed height (`height:auto`, `flex-column` ไม่มี height) → **ห้ามใช้ NONE layout + hardcode `h`** — ต้องใช้ VERTICAL AL + `layoutSizingVertical='HUG'` (child ของ AL parent) หรือ `primaryAxisSizingMode='AUTO'` (standalone) เพื่อให้ height เติบโตตาม content
- **Height default = HUG กฎเหล็ก**: ถ้า CSS element ไม่มี explicit height → ต้องส่ง `sh='hug'` ใน mnt() เสมอ — ห้ามปล่อย sh=undefined (จะเหลือ Figma default h:100 หรือ h:1) และห้ามใช้ `sh='fill'` ถ้า CSS ไม่ได้บอกว่า `height:100%` หรือ `flex-grow` ในแนวตั้ง

### Sizing Map (CSS → Figma layoutSizing)

#### HEIGHT — ไม่มีค่า = HUG เสมอ
| CSS pattern | Figma layoutSizingVertical | mnt() sh |
|---|---|---|
| ไม่มี height / `height: auto` / flex ไม่ set height | `"HUG"` — **ห้าม default 1px, ห้าม FILL** | `'hug'` |
| `height: Xpx` explicit | `"FIXED"` | ไม่ส่ง sh |
| `height: 100%` หรือ `flex-grow > 0` ในแนวตั้ง | `"FILL"` | `'fill'` |

#### WIDTH — ไม่มีค่าขึ้นกับ parent
| CSS pattern | Figma layoutSizingHorizontal | mnt() sw |
|---|---|---|
| flex-column parent ที่ `align-items: stretch` (CSS default) + ไม่มี explicit width | `"FILL"` — CSS stretches by default | `'fill'` |
| `width: 100%` | `"FILL"` | `'fill'` |
| `flex-grow: 1` | `"FILL"` | `'fill'` |
| flex-column parent ที่ `align-items: center/start/end` + ไม่มี explicit width | `"HUG"` | `'hug'` |
| `flex-shrink: 0` ไม่มี explicit width | `"HUG"` — ยึด content | `'hug'` |
| `width: Xpx` explicit | `"FIXED"` | ไม่ส่ง sw |
| `display: block` ไม่อยู่ใน flex | `"FILL"` (stretch) | `'fill'` |
| `width: fit-content` / `auto` ที่ต้องการ HUG | `"HUG"` | `'hug'` |

### af() helper — กฎบังคับ
เมื่อ set `f.layoutMode = dir` Figma plugin API จะ **reset `primaryAxisSizingMode` เป็น `'AUTO'` อัตโนมัติ** ทำให้ frame HUG content แทนที่จะ keep ขนาด `resize()` ที่ตั้งไว้
ต้องเพิ่ม 2 บรรทัดนี้ทันทีหลัง `f.layoutMode = dir` เสมอ:

```javascript
function af({name, dir='NONE', w=100, h=100, gap=0, pt=0, pr=0, pb=0, pl=0, ax='MIN', ay='MIN'}) {
  const f = figma.createFrame();
  f.name = name; f.resize(w, h); f.fills = []; f.clipsContent = false;
  if (dir !== 'NONE') {
    f.layoutMode = dir;
    f.primaryAxisSizingMode = 'FIXED'; // *** บังคับ — ป้องกัน AUTO reset หลัง set layoutMode ***
    f.counterAxisSizingMode = 'FIXED'; // *** บังคับ — mnt() หรือ explicit override ค่อยเปลี่ยน ***
    f.itemSpacing = gap;
    f.paddingTop = pt; f.paddingRight = pr; f.paddingBottom = pb; f.paddingLeft = pl;
    f.primaryAxisAlignItems = ax; f.counterAxisAlignItems = ay;
  }
  return f;
}
```

หลัง af() ถ้าต้องการ HUG standalone (ไม่อยู่ใน AL parent) ให้ override ด้วย `f.primaryAxisSizingMode='AUTO'` แยกต่างหาก
mnt() จะ override ด้วย `layoutSizingHorizontal/Vertical` ตามปกติเมื่อ child อยู่ใน AL parent

### mnt() helper — กฎบังคับ
`mnt(parent, child, sw, sh)` ต้องมี 3 guards เสมอ:
1. **auto-layout guard**: `layoutSizing*` set ได้เฉพาะ child ของ auto-layout frame (`p.layoutMode !== 'NONE'`) เท่านั้น — ถ้า parent เป็น NONE layout จะ error
2. **text node guard**: TEXT node ห้าม set `layoutSizingVertical` — height มาจาก content เสมอ; FILL width → ต้อง switch `textAutoResize='HEIGHT'`
3. **HUG child guard**: `layoutSizingHorizontal/Vertical = 'HUG'` ใช้ได้เฉพาะ AL frame child (`c.layoutMode !== 'NONE'`) หรือ TEXT node เท่านั้น — NONE-layout FRAME ห้าม HUG (ให้ stay FIXED); ถ้าส่ง `sw='hug'` หรือ `sh='hug'` กับ NONE-layout child จะ skip โดยไม่ error

```javascript
function mnt(p, c, sw, sh) {
  p.appendChild(c);
  const inAL = p.layoutMode !== 'NONE';
  if (inAL) {
    const childAL = c.type === 'FRAME' && c.layoutMode !== 'NONE';
    const isText = c.type === 'TEXT';
    if (sw === 'fill') {
      c.layoutSizingHorizontal = 'FILL';
      if (isText) c.textAutoResize = 'HEIGHT';
    } else if (sw === 'hug' && (childAL || isText)) {
      c.layoutSizingHorizontal = 'HUG'; // NONE-layout FRAME → skip, stays FIXED
    }
    if (!isText) {
      if (sh === 'fill') c.layoutSizingVertical = 'FILL';
      else if (sh === 'hug' && childAL) c.layoutSizingVertical = 'HUG'; // same guard
    }
  }
  return c;
}
```

Output format ของ plugin code:
- Figma Plugin JS เท่านั้น (ไม่มี wrapper อื่น)
- comment อธิบาย sizing decision แต่ละ element
- ใช้ `figma.createFrame()`, `figma.createText()`, `figma.createRectangle()`
- จัด nested structure ให้ตรงกับ HTML hierarchy

### Asset Lookup Order (ทำตามลำดับเสมอ)
Component (ทำหลังจาก map สีและ font เสร็จ):
1. `figma.getLocalComponents()` → สร้าง map `{name.toLowerCase(): component}`
2. เทียบ HTML element (class name / role / structure) กับ component name
   - ถ้าตรง → `component.createInstance()` แล้ว set property/text overrides
   - ถ้าไม่ตรง → สร้างด้วย `figma.createFrame()` ตามปกติ (ห้ามบังคับ map)
3. เกณฑ์ "ตรงกัน": ชื่อ class ใกล้เคียง + structure เหมือน (เช่น button→button, icon-btn→Icon button)
4. อย่า map ถ้าไม่แน่ใจ — สร้างใหม่ดีกว่า override ผิด component

สี (ทำทุกครั้งก่อน sync — **ห้าม hardcode styleId**):
1. ดึง color styles จาก Figma ด้วย `figma.getLocalPaintStyles()` → สร้าง 2 maps:
   - SOLID: `{hex: styleId}` (hex จาก `Math.round(c.r*255).toString(16)`)
   - GRADIENT: `{styleName: styleId}` (เทียบด้วย Figma style name)
2. เทียบ hex/name แต่ละค่าใน HTML กับ map → ถ้าตรง ใช้ `node.fillStyleId = styleId` แทน `node.fills`
3. ไม่ตรง → ใช้ `node.fills` ตรงๆ + บันทึกลง unmatched_colors list

```javascript
const paintStyles = figma.getLocalPaintStyles();
const solidByHex = {}, gradByName = {};
for (const s of paintStyles) {
  if (s.paints[0]?.type === 'SOLID') {
    const {r,g,b} = s.paints[0].color;
    const hex = [r,g,b].map(v=>'0'+Math.round(v*255).toString(16)).map(h=>h.slice(-2)).join('');
    solidByHex['#'+hex] = s.id;
  } else {
    gradByName[s.name] = s.id;
  }
}
```

Text style (ทำทุกครั้งก่อน sync — **ห้าม hardcode styleId**):
1. ดึง text styles จาก Figma ด้วย `figma.getLocalTextStyles()` → สร้าง map `{styleName: styleId}`
   - **ชื่ออาจซ้ำได้** (duplicate จาก library) → ใช้ **first occurrence เท่านั้น** (ห้าม overwrite)
   ```javascript
   const textByName = {};
   for (const s of figma.getLocalTextStyles())
     if (!textByName[s.name]) textByName[s.name] = s.id;
   ```
2. เทียบ font ใน HTML → ถ้าตรง ใช้ `textNode.textStyleId = styleId`
3. ไม่ตรง → set fontName/fontSize ตรงๆ

Paint style ก็เช่นกัน — ถ้าชื่อซ้ำ ใช้ first occurrence:
```javascript
const solidByHex = {}, gradByName = {};
for (const s of figma.getLocalPaintStyles()) {
  if (s.paints[0]?.type === 'SOLID') {
    const {r,g,b} = s.paints[0].color;
    const hex = '#' + [r,g,b].map(v=>'0'+Math.round(v*255).toString(16)).map(h=>h.slice(-2)).join('');
    if (!solidByHex[hex]) solidByHex[hex] = s.id;
  } else {
    if (!gradByName[s.name]) gradByName[s.name] = s.id;
  }
}
```

**setFill() helper — บังคับใช้ทุกครั้งแทน `node.fills = ...`** รองรับทั้ง solid และ gradient:
```javascript
// setFill(node, fill, gradStyleName?)
// - solid: ลอง solidByHex → fillStyleId; fallback inline
// - gradient: ถ้ามี gradStyleName ลอง gradByName ก่อน; fallback fills
function setFill(node, fill, gradStyleName=null) {
  if (gradStyleName && gradByName[gradStyleName]) {
    node.fillStyleId = gradByName[gradStyleName]; return;
  }
  if (fill.length===1 && fill[0].type==='SOLID' && (fill[0].opacity??1)>=1) {
    const{r,g,b}=fill[0].color;
    const hex='#'+[r,g,b].map(v=>'0'+Math.round(v*255).toString(16)).map(h=>h.slice(-2)).join('');
    if(solidByHex[hex]){node.fillStyleId=solidByHex[hex];return;}
  }
  node.fills=fill;
}
```
- Solid color → `setFill(node, sf('#hex'))` — จะใช้ fillStyleId ถ้า style ตรง
- Gradient มี style → `setFill(node, lgr(...), 'Woft/Gradient/Icon Gradient')` — ใช้ fillStyleId; fallback lgr() ถ้าไม่เจอ
- Gradient ไม่มี style (deco gold, deco bottom) → `node.fills = lgr(...)` ตรงๆ
- Text fill → เรียก `setFill(t, fill, gradStyleName?)` **หลัง** `t.characters = chars` เสมอ
- Opacity < 1 → fallback inline (style ไม่มี opacity variant)

รูป (ทำตามลำดับ — `createImageAsync(url)` ไม่รองรับใน MCP sandbox):
1. **Raster (PNG/JPG)**: ค้นหา node ด้วยชื่อ (`pg.findOne(n=>n.name==='ชื่อรูป')`) บน Page ต้นฉบับ — **ห้ามใช้ instance ID (I96:108;56) เพราะ Figma ไม่ return ข้ามหน้า** ให้ใช้ direct node ID เท่านั้น → `fills.find(f=>f.type==='IMAGE').imageHash` → ใช้ hash ตรงๆ
2. **SVG/Vector**: เช่นกัน — ค้นหา component/instance node ด้วยชื่อหรือ direct node ID (ไม่ขึ้นต้น I); `node.exportAsync({format:'SVG'})` → decode ด้วย char loop (ห้าม TextDecoder) → `figma.createNodeFromSvg(svgStr)` → resize ให้ตรง spec
   ```javascript
   const bytes = await node.exportAsync({format:'SVG'});
   const CHUNK=4096; let str='';
   for(let i=0;i<bytes.length;i+=CHUNK) str+=String.fromCharCode(...bytes.slice(i,i+CHUNK));
   const svgNode = figma.createNodeFromSvg(str);
   svgNode.resize(w, h);
   ```
3. ไม่มี node เดิมเลย → แจ้ง user อย่า generate เอง

ห้าม crop / resize / recolor / สร้าง placeholder แทน asset จริง

### Remark ใน Figma (HTML → Figma)
หลัง sync ทุกครั้ง ต้องสร้าง annotation frame **1 อัน** ด้านบน screen เสมอ
วางที่ `x = screen.x`, `y = screen.y - remark.height - 20`
- บังคับใช้ทั้ง page ปกติ, page ที่ user ตั้งชื่อเอง, และ `[Dev Change] Update Codex ...` page — ห้าม skip เพราะไม่ได้ใช้ `[Dev Change]` page
- Remark ต้องสรุป `change_summary` สำคัญด้วย: variables/styles/components ที่ใช้, skipped/fallback เหตุผล, mismatch, missing assets, unmatched colors
- ถ้ามี remark เดิมของ frame เดียวกัน ต้องลบ/replace ก่อนสร้างใหม่เสมอ เพื่อไม่ให้ remark เก่าค้าง

format ข้อความใน frame เดียว:
```
[Dev Change] Sync Remarks dd/mm/yy hh:mm

⚠️ MISMATCH
- รายการที่ HTML มีแต่ Figma ยังไม่ตรง

✅ OK
- รายการที่ sync สำเร็จ

🎨 DESIGN SYSTEM
- Variables/paint/text/effect styles/components ที่ใช้

↩ FALLBACK / SKIPPED
- รายการที่ไม่ได้ใช้ component/style พร้อมเหตุผล
```
- **timestamp บังคับทุกครั้ง** — ห้ามละเว้น ใช้ค่า `ts` เดียวกับที่คำนวณสำหรับ page name (UTC+7)
- `ts` ต้อง interpolate เข้าไปใน string ตรงๆ: `` `[Dev Change] Sync Remarks ${ts}` ``

สร้างด้วย VERTICAL AL Frame + Text node เดียว (ไม่ใช่ Sticky — ใช้ได้แค่ FigJam):
```javascript
const rem=figma.createFrame();
rem.name=remFname; rem.resize(300,100);
rem.fills=[{type:'SOLID',color:{r:1,g:.992,b:.878}}]; rem.cornerRadius=4;
rem.layoutMode='VERTICAL'; rem.primaryAxisSizingMode='AUTO'; rem.counterAxisSizingMode='FIXED';
rem.paddingTop=10; rem.paddingRight=10; rem.paddingBottom=10; rem.paddingLeft=10;
const remT=figma.createText();
remT.characters=`[Dev Change] Sync Remarks ${ts}\n\n⚠️ MISMATCH\n...\n\n✅ OK\n...`;
remT.fontName={family:'Inter',style:'Regular'}; remT.fontSize=11;
rem.appendChild(remT); remT.layoutSizingHorizontal='FILL'; // wrap text ใน 280px
pg.appendChild(rem); rem.x=scr.x; rem.y=scr.y-rem.height-20;
```

### Frame Replace บน [Dev Change] page
- หา page ชื่อขึ้นต้น `[Dev Change] Update Codex` → ใช้ page นั้น; **อัปเดตชื่อ page เป็น timestamp ปัจจุบันทุกครั้ง** (ไม่ clear ทั้ง page)
- ไม่เจอ → สร้าง page ใหม่, format: `[Dev Change] Update Codex dd/mm/yy hh:mm`
- ```javascript
  // ทุกครั้ง — อัปเดต timestamp ไม่ว่าจะสร้างใหม่หรือใช้ page เดิม
  let pg = figma.root.children.find(p => p.name.startsWith('[Dev Change] Update Codex'));
  if (!pg) { pg = figma.createPage(); }
  pg.name = `[Dev Change] Update Codex ${ts}`; // always stamp
  ```
- **Frame name**: อิงจากชื่อไฟล์ HTML (ไม่รวม extension) เช่น `index.html` → frame ชื่อ `index`
- บน page นั้น หา frame ชื่อตรงกับ HTML filename → replace in-place (จด x,y → remove → สร้างใหม่)
- ไม่เจอ → ใช้ลำดับนี้:
  ```javascript
  const ex    = pg.children.find(c => c.name === FNAME);
  const exRem = pg.children.find(c => c.name === `[Remark] ${FNAME}`);
  let fx=0, fy=0;
  if(ex){
    fx=ex.x; fy=ex.y; ex.remove();
    if(exRem) exRem.remove();                                // ลบ remark เดิมด้วย (สร้างใหม่ท้าย)
  } else if(exRem){
    fx = exRem.x; fy = exRem.y + exRem.height + 20;         // remark กำพร้า → frame ใหม่อยู่ใต้ remark
    if(fy < 0) fy = 0;
    exRem.remove();
  } else {
    // nับเฉพาะ main frames (ไม่รวม [Remark]) — remark วางเหนือ frame ไม่ชนกัน
    const mains = pg.children.filter(c => !c.name.startsWith('[Remark]'));
    fx = mains.length > 0 ? Math.max(...mains.map(c=>c.x+c.width)) + 100 : 0;
  }
  ```
- **Remark frame name**: `[Remark] {frame-name}` เช่น `[Remark] index`
- **Remark position — เหนือ frame เสมอ** ไม่ทับตัว frame หลัก และไม่ชนกับ frame ข้างๆ (เพราะ remark อยู่คนละแกน y):
  ```javascript
  const exRemF = pg.children.find(c => c.name === remFname);
  if (exRemF) exRemF.remove();
  // ... สร้าง rem frame + text ...
  pg.appendChild(rem);
  rem.x = scr.x;
  rem.y = scr.y - rem.height - 20;  // above frame, same x — ไม่ทับ frame ข้างๆ
  ```
- Timezone: UTC+7 manual offset — `const thai = new Date(new Date().getTime() + 7*60*60*1000)` ใช้ `getUTC*()` methods
