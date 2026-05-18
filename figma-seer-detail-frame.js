// Figma Plugin JS for POC-TEST-FIGMA-CLAUDE
// Creates/replaces a "seer-detail" UI frame on a [Dev Change] page.
// Run via the Figma plugin/MCP bridge. Do not wrap this in an async IIFE.

const createdNodeIds = [];
const mutatedNodeIds = [];
const missingAssets = [];
const unmatchedColors = [];
const skipped = [];

const now = new Date();
const bkk = new Date(now.getTime() + 7 * 60 * 60 * 1000);
const pad = (n) => String(n).padStart(2, "0");
const ts = `${pad(bkk.getUTCDate())}/${pad(bkk.getUTCMonth() + 1)}/${String(bkk.getUTCFullYear()).slice(-2)} ${pad(bkk.getUTCHours())}:${pad(bkk.getUTCMinutes())}`;

await Promise.all([
  figma.loadFontAsync({ family: "Cinzel", style: "Bold" }),
  figma.loadFontAsync({ family: "Cinzel Decorative", style: "Bold" }),
  figma.loadFontAsync({ family: "Cormorant Garamond", style: "Regular" }),
  figma.loadFontAsync({ family: "Inter", style: "Regular" }),
]);

const paintStyles = figma.getLocalPaintStyles();
const textStyles = figma.getLocalTextStyles();
const effectStyles = figma.getLocalEffectStyles();
const components = figma.getLocalComponents();

const solidByHex = {};
const gradByName = {};
for (const s of paintStyles) {
  const p = s.paints[0];
  if (!p) continue;
  if (p.type === "SOLID") {
    const { r, g, b } = p.color;
    const hex = "#" + [r, g, b].map((v) => ("0" + Math.round(v * 255).toString(16)).slice(-2)).join("");
    if (!solidByHex[hex]) solidByHex[hex] = s.id;
  } else if (!gradByName[s.name]) {
    gradByName[s.name] = s.id;
  }
}

const textByName = {};
for (const s of textStyles) if (!textByName[s.name]) textByName[s.name] = s.id;

const effectByName = {};
for (const s of effectStyles) if (!effectByName[s.name]) effectByName[s.name] = s.id;

const compByName = {};
for (const c of components) if (!compByName[c.name.toLowerCase()]) compByName[c.name.toLowerCase()] = c;

function rgb(hex, opacity = 1) {
  const clean = hex.replace("#", "");
  return {
    type: "SOLID",
    color: {
      r: parseInt(clean.slice(0, 2), 16) / 255,
      g: parseInt(clean.slice(2, 4), 16) / 255,
      b: parseInt(clean.slice(4, 6), 16) / 255,
    },
    opacity,
  };
}

function lgr(stops) {
  return [{
    type: "GRADIENT_LINEAR",
    gradientTransform: [[1, 0, 0], [0, 1, 0]],
    gradientStops: stops.map((s) => ({
      position: s.position,
      color: { ...rgb(s.hex, s.opacity ?? 1).color, a: s.opacity ?? 1 },
    })),
  }];
}

function setFill(node, fill, gradStyleName = null) {
  if (gradStyleName && gradByName[gradStyleName]) {
    node.fillStyleId = gradByName[gradStyleName];
    return gradStyleName;
  }
  if (fill.length === 1 && fill[0].type === "SOLID" && (fill[0].opacity ?? 1) >= 1) {
    const { r, g, b } = fill[0].color;
    const hex = "#" + [r, g, b].map((v) => ("0" + Math.round(v * 255).toString(16)).slice(-2)).join("");
    if (solidByHex[hex]) {
      node.fillStyleId = solidByHex[hex];
      return hex;
    }
    unmatchedColors.push(hex);
  }
  node.fills = fill;
  return gradStyleName || "inline";
}

function af({ name, dir = "NONE", w = 100, h = 100, gap = 0, pt = 0, pr = 0, pb = 0, pl = 0, ax = "MIN", ay = "MIN" }) {
  const f = figma.createFrame();
  createdNodeIds.push(f.id);
  f.name = name;
  f.resize(w, h);
  f.fills = [];
  f.clipsContent = false;
  if (dir !== "NONE") {
    f.layoutMode = dir;
    f.primaryAxisSizingMode = "FIXED";
    f.counterAxisSizingMode = "FIXED";
    f.itemSpacing = gap;
    f.paddingTop = pt;
    f.paddingRight = pr;
    f.paddingBottom = pb;
    f.paddingLeft = pl;
    f.primaryAxisAlignItems = ax;
    f.counterAxisAlignItems = ay;
  }
  return f;
}

function mnt(p, c, sw, sh) {
  p.appendChild(c);
  const inAL = p.layoutMode !== "NONE";
  if (inAL) {
    const childAL = (c.type === "FRAME" || c.type === "INSTANCE") && c.layoutMode !== "NONE";
    const isText = c.type === "TEXT";
    if (sw === "fill") {
      c.layoutSizingHorizontal = "FILL";
      if (isText) c.textAutoResize = "HEIGHT";
    } else if (sw === "hug" && (childAL || isText)) {
      c.layoutSizingHorizontal = "HUG";
    }
    if (!isText) {
      if (sh === "fill") c.layoutSizingVertical = "FILL";
      else if (sh === "hug" && childAL) c.layoutSizingVertical = "HUG";
    }
  }
  return c;
}

function txt(name, chars, fontName, fontSize, fill, align = "LEFT", textStyleName = null) {
  const t = figma.createText();
  createdNodeIds.push(t.id);
  t.name = name;
  t.characters = chars;
  if (textStyleName && textByName[textStyleName]) {
    t.textStyleId = textByName[textStyleName];
  } else {
    t.fontName = fontName;
    t.fontSize = fontSize;
  }
  t.textAlignHorizontal = align;
  setFill(t, fill);
  return t;
}

async function findImageHashByNames(names) {
  for (const page of figma.root.children) {
    await figma.setCurrentPageAsync(page);
    const node = page.findOne((n) => names.includes(n.name.toLowerCase()));
    const paint = node?.fills?.find?.((f) => f.type === "IMAGE" && f.imageHash);
    if (paint?.imageHash) return { imageHash: paint.imageHash, sourceNode: node.name };
  }
  return null;
}

let pg = figma.root.children.find((p) => p.name.startsWith("[Dev Change] Update Codex"));
if (!pg) {
  pg = figma.createPage();
  createdNodeIds.push(pg.id);
}
pg.name = `[Dev Change] Update Codex ${ts}`;
mutatedNodeIds.push(pg.id);
await figma.setCurrentPageAsync(pg);

const existing = pg.children.find((n) => n.type === "FRAME" && n.name === "seer-detail");
const existingPos = existing ? { x: existing.x, y: existing.y } : null;
if (existing) existing.remove();

const rightmost = pg.children.reduce((max, n) => Math.max(max, n.x + n.width), 0);
const screen = af({ name: "seer-detail", dir: "VERTICAL", w: 390, h: 844, gap: 16, pt: 24, pr: 16, pb: 28, pl: 16, ax: "MIN", ay: "CENTER" });
setFill(screen, [rgb("#181715")]);
screen.x = existingPos?.x ?? rightmost + 80;
screen.y = existingPos?.y ?? 120;
pg.appendChild(screen);

const top = af({ name: "top-section", dir: "VERTICAL", w: 358, h: 720, gap: 12, pt: 12, pr: 0, pb: 0, pl: 0, ax: "MIN", ay: "MIN" });
mnt(screen, top, "fill", "fill");

const inner = af({ name: "inner-section", dir: "VERTICAL", w: 358, h: 549, gap: 18, pt: 0, pr: 24, pb: 0, pl: 24, ax: "MIN", ay: "CENTER" });
mnt(top, inner, "fill", "hug");

const revealTitle = af({ name: "reveal-title", dir: "VERTICAL", w: 310, h: 36, gap: 0, ax: "MIN", ay: "CENTER" });
mnt(inner, revealTitle, "fill", "hug");
mnt(revealTitle, txt("Your Role", "Your Role", { family: "Cinzel", style: "Bold" }, 14, [rgb("#BAB7AC")], "CENTER", "text/label/large"), "fill");
mnt(revealTitle, txt("Has Been Revealed", "Has Been Revealed", { family: "Cinzel", style: "Bold" }, 14, [rgb("#BAB7AC")], "CENTER", "text/label/large"), "fill");

const card = af({ name: "role-card", dir: "NONE", w: 306.306, h: 388 });
card.cornerRadius = 20.392;
setFill(card, lgr([
  { position: 0, hex: "#900904" },
  { position: 0.66667, hex: "#B9EAE8", opacity: 0.3 },
  { position: 1, hex: "#900904", opacity: 0.6 },
]), "Woft/Gradient/BG Gradient");
mnt(inner, card);

const cardInner = af({ name: "role-card-inner", dir: "NONE", w: 291.012, h: 372.706 });
cardInner.cornerRadius = 15.294;
cardInner.clipsContent = true;
cardInner.x = 7.647;
cardInner.y = 7.647;
card.appendChild(cardInner);

const seerImage = await findImageHashByNames(["seer", "role seer", "seer image", "the seer"]);
if (seerImage) {
  const img = figma.createRectangle();
  createdNodeIds.push(img.id);
  img.name = `role-image (${seerImage.sourceNode})`;
  img.resize(291.012, 372.706);
  img.cornerRadius = 15.294;
  img.fills = [{ type: "IMAGE", scaleMode: "FILL", imageHash: seerImage.imageHash }];
  cardInner.appendChild(img);
} else {
  missingAssets.push("No existing Figma image node named Seer / Role Seer / Seer Image / The Seer was found; role image was intentionally not generated.");
}

const nameBox = af({ name: "role-name-container", dir: "VERTICAL", w: 285.734, h: 104, gap: 9, ax: "MIN", ay: "CENTER" });
mnt(inner, nameBox, "hug", "hug");

const decoTop = af({ name: "deco-top-bar", dir: "NONE", w: 285.734, h: 6 });
mnt(nameBox, decoTop);
const leftLine = figma.createRectangle();
createdNodeIds.push(leftLine.id);
leftLine.name = "deco-left-line";
leftLine.resize(40, 1);
leftLine.x = 87.86;
leftLine.y = 2.5;
setFill(leftLine, lgr([{ position: 0, hex: "#000000", opacity: 0 }, { position: 1, hex: "#E8A530", opacity: 0.5 }]));
decoTop.appendChild(leftLine);
const diamond = figma.createRectangle();
createdNodeIds.push(diamond.id);
diamond.name = "deco-diamond";
diamond.resize(6, 6);
diamond.rotation = 45;
diamond.x = 140;
diamond.y = -0.5;
setFill(diamond, [rgb("#900904")]);
decoTop.appendChild(diamond);
const rightLine = figma.createRectangle();
createdNodeIds.push(rightLine.id);
rightLine.name = "deco-right-line";
rightLine.resize(40, 1);
rightLine.x = 157.86;
rightLine.y = 2.5;
setFill(rightLine, lgr([{ position: 0, hex: "#E8A530", opacity: 0.5 }, { position: 1, hex: "#000000", opacity: 0 }]));
decoTop.appendChild(rightLine);

const heading = af({ name: "role-heading-area", dir: "VERTICAL", w: 285.734, h: 87, gap: 10, ax: "MIN", ay: "CENTER" });
mnt(nameBox, heading, "fill", "hug");
const title = txt("role-title", "SEER", { family: "Cinzel Decorative", style: "Bold" }, 33, lgr([{ position: 0, hex: "#920503" }, { position: 1, hex: "#B5EAE8" }]), "CENTER", "text/display/h1");
if (effectByName["Title token"]) title.effectStyleId = effectByName["Title token"];
mnt(heading, title, "fill");
const subtitle = txt("role-subtitle", "See through the darkness and reveal one player's true alignment each night.", { family: "Cormorant Garamond", style: "Regular" }, 14, [rgb("#BAB7AC")], "CENTER", "text/body/large");
subtitle.textAutoResize = "HEIGHT";
mnt(heading, subtitle, "fill");

const bottom = figma.createRectangle();
createdNodeIds.push(bottom.id);
bottom.name = "deco-bottom-inner";
bottom.resize(64, 1);
setFill(bottom, lgr([{ position: 0, hex: "#000000", opacity: 0 }, { position: 0.5, hex: "#003333", opacity: 0.3 }, { position: 1, hex: "#000000", opacity: 0 }]));
mnt(nameBox, bottom);

const infoCard = af({ name: "info-card", dir: "VERTICAL", w: 358, h: 132, gap: 8, pt: 12, pr: 12, pb: 12, pl: 12, ax: "MIN", ay: "MIN" });
infoCard.cornerRadius = 24;
setFill(infoCard, lgr([{ position: 0, hex: "#303030", opacity: 0 }, { position: 0.85, hex: "#303030" }]), "Woft/Gradient/Grey Gradient");
mnt(top, infoCard, "fill", "hug");

function infoRow(rowName, label, desc, iconName) {
  const row = af({ name: rowName, dir: "HORIZONTAL", w: 334, h: 52, gap: 12, pt: 8, pr: 8, pb: 8, pl: 8, ax: "MIN", ay: "MIN" });
  mnt(infoCard, row, "fill", "hug");
  const icon = af({ name: iconName, dir: "NONE", w: 36, h: 36 });
  icon.cornerRadius = 8;
  setFill(icon, lgr([{ position: 0, hex: "#900904" }, { position: 1, hex: "#212121" }]), "Woft/Gradient/Icon Gradient");
  mnt(row, icon);
  const glyph = txt(`${iconName}-glyph`, iconName.includes("ability") ? "?" : "V", { family: "Inter", style: "Regular" }, 14, [rgb("#FFFFFF")], "CENTER");
  glyph.x = 0;
  glyph.y = 9;
  glyph.resize(36, 18);
  icon.appendChild(glyph);
  skipped.push(`${iconName}: reused gradient icon container, but local SVG component lookup is unavailable in this standalone script.`);
  const col = af({ name: `${rowName}-text`, dir: "VERTICAL", w: 270, h: 36, gap: 2, ax: "MIN", ay: "MIN" });
  mnt(row, col, "fill", "hug");
  mnt(col, txt(`${rowName}-label`, label, { family: "Cinzel", style: "Bold" }, 12, [rgb("#FFF9E2")], "LEFT", "text/label/medium"), "fill");
  const d = txt(`${rowName}-desc`, desc, { family: "Cormorant Garamond", style: "Regular" }, 14, [rgb("#BAB7AC")], "LEFT", "text/body/large");
  d.textAutoResize = "HEIGHT";
  mnt(col, d, "fill");
}

infoRow("ability-row", "Divine Sight", "Each night, choose one player to learn whether they are a werewolf or innocent.", "icon-ability");
infoRow("win-row", "Victory", "Win with the village by identifying the wolves before they overrun the town.", "icon-win");

const start = af({ name: "start-btn", dir: "VERTICAL", w: 358, h: 50, pt: 16, pr: 16, pb: 16, pl: 16, ax: "CENTER", ay: "CENTER" });
start.cornerRadius = 16;
setFill(start, [rgb("#900904")]);
mnt(screen, start, "fill");
mnt(start, txt("start-btn-label", "STart", { family: "Cinzel", style: "Bold" }, 14, [rgb("#FFFFFF")], "CENTER", "text/label/large"), "fill");

if (screen.height < 844) {
  screen.primaryAxisSizingMode = "FIXED";
  screen.resize(390, 844);
}

const remFname = `[Dev Change] Sync Remarks seer-detail`;
const oldRemark = pg.children.find((n) => n.type === "FRAME" && n.name === remFname);
if (oldRemark) oldRemark.remove();

const usedPaintStyles = [
  gradByName["Woft/Gradient/BG Gradient"] ? "Woft/Gradient/BG Gradient" : null,
  gradByName["Woft/Gradient/Grey Gradient"] ? "Woft/Gradient/Grey Gradient" : null,
  gradByName["Woft/Gradient/Icon Gradient"] ? "Woft/Gradient/Icon Gradient" : null,
].filter(Boolean);
const usedTextStyles = ["text/label/large", "text/display/h1", "text/body/large", "text/label/medium"].filter((n) => textByName[n]);
const usedEffectStyles = effectByName["Title token"] ? ["Title token"] : [];

const rem = af({ name: remFname, dir: "VERTICAL", w: 300, h: 100, gap: 0, pt: 10, pr: 10, pb: 10, pl: 10, ax: "MIN", ay: "MIN" });
rem.cornerRadius = 4;
setFill(rem, [rgb("#FFFDE0")]);
const remText = txt(
  "sync-remarks",
  `[Dev Change] Sync Remarks ${ts}\n\nMISMATCH\n- ${missingAssets.length ? missingAssets.join("\n- ") : "None detected"}\n\nOK\n- Created/replaced seer-detail frame on ${pg.name}\n- Followed role reveal hierarchy from local HTML/CSS\n\nDESIGN SYSTEM\n- Paint styles: ${usedPaintStyles.length ? usedPaintStyles.join(", ") : "inline fallback"}\n- Text styles: ${usedTextStyles.length ? usedTextStyles.join(", ") : "inline fallback"}\n- Effect styles: ${usedEffectStyles.length ? usedEffectStyles.join(", ") : "inline fallback"}\n\nFALLBACK / SKIPPED\n- ${skipped.length ? skipped.join("\n- ") : "None"}`,
  { family: "Inter", style: "Regular" },
  11,
  [rgb("#303030")],
  "LEFT"
);
remText.textAutoResize = "HEIGHT";
mnt(rem, remText, "fill");
pg.appendChild(rem);
rem.x = screen.x;
rem.y = screen.y - rem.height - 20;

const change_summary = {
  frame: "seer-detail",
  page: pg.name,
  colorVariables: [],
  paintStyles: usedPaintStyles,
  textStyles: usedTextStyles,
  effectStyles: usedEffectStyles,
  components: [],
  skipped,
  missingAssets,
  unmatchedColors: [...new Set(unmatchedColors)],
  nodeTree: {
    screen: screen.id,
    sections: ["top-section", "inner-section", "role-card", "role-name-container", "info-card", "start-btn"],
  },
};

return { createdNodeIds, mutatedNodeIds, change_summary };
