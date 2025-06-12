import { Box3, Box3Helper, BufferGeometry, ClampToEdgeWrapping, Color, DoubleSide, Float32BufferAttribute, Group, Material, Mesh, MeshBasicMaterial, RepeatWrapping, TextureLoader, Triangle, Vector2, Vector3 } from "three";


function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [r, g, b];
}

function decodeRSColor(value: number): [number, number, number] {
  const h = (((value >> 10) & 0x3f) * 360) / 64; // 6 bits hue
  const s = (((value >> 7) & 0x07) * 100) / 8; // 3 bits sat
  const l = ((value & 0x7f) * 100) / 128; // 7 bits light
  return hslToRgb(h, s, l);
}

import exampleFile from '../public/model-definitions/1148.json';

function pmnToUV(
  a: Vector3,
  b: Vector3,
  c: Vector3,
  p: Vector3,
  m: Vector3,
  n: Vector3
): [Vector2, Vector2, Vector2] {
  const f1 = new Vector3().subVectors(m, p);
  const f2 = new Vector3().subVectors(n, p);

  const f1DotF1 = f1.dot(f1);
  const f1DotF2 = f1.dot(f2);
  const f2DotF2 = f2.dot(f2);

  const det = f1DotF1 * f2DotF2 - f1DotF2 * f1DotF2;
  const invDet = 1 / det;

  const i00 = f2DotF2 * invDet;
  const i01 = -f1DotF2 * invDet;
  const i10 = -f1DotF2 * invDet;
  const i11 = f1DotF1 * invDet;

  const toUV = (v: Vector3) => {
    const projection = new Vector2(f1.dot(v), f2.dot(v));
    return new Vector2(
      i00 * projection.x + i01 * projection.y,
      i10 * projection.x + i11 * projection.y
    );
  };

  return [
    toUV(a.clone().sub(p)),
    toUV(b.clone().sub(p)),
    toUV(c.clone().sub(p)),
  ];
}

const textureLoader = new TextureLoader();

function getTextureMaterial(textureId: number): Material {
  if (textureId === -1) {
    return new MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      side: DoubleSide,
    });
  }

  const tex = textureLoader.load(`textures/${textureId}.png`);

  // ✅ Apply wrap modes
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = RepeatWrapping;

  return new MeshBasicMaterial({
    map: tex,
    side: DoubleSide,
    vertexColors: true,
    transparent: true,
    alphaTest: 0.5,
  });
}

function applyRecolor(
  color: number,
  find: number[],
  replace: number[]
): [number, number, number] {
  const index = find.indexOf(color);
  const newColor =
    index !== -1 && index < replace.length ? replace[index] : color;
  return decodeRSColor(newColor);
}

export class Model {
  protected modelDef: typeof exampleFile;

  constructor(modelDef: any) {
    this.modelDef = modelDef;
  }

  constructModel(rotation: number): Group {
    const model = new Group();

    if (
      this.modelDef &&
      this.modelDef.vertexX &&
      this.modelDef.faceIndices1
    ) {
      const vertexCountOk =
        this.modelDef.vertexX.length ===
          this.modelDef.vertexY.length &&
        this.modelDef.vertexY.length === this.modelDef.vertexZ.length;

      if (!vertexCountOk) {
        console.warn("Vertex array mismatch");
        throw new Error("Vertex array mismatch");
      }

      const geometry = new BufferGeometry();
      const vertices: Vector3[] = this.modelDef.vertexX.map(
        (_, i: number) =>
          new Vector3(
            this.modelDef.vertexX[i],
            this.modelDef.vertexY[i],
            this.modelDef.vertexZ[i]
          )
      );

      const positions: number[] = [];
      const uvs: number[] = [];
      const colors: number[] = [];

      const groups = new Map<number, number[]>();
      let vertexOffset = 0;

      for (let i = 0; i < this.modelDef.faceIndices1.length; i++) {
        const i1 = this.modelDef.faceIndices1[i];
        const i2 = this.modelDef.faceIndices2[i];
        const i3 = this.modelDef.faceIndices3[i];

        if (
          i1 >= vertices.length ||
          i2 >= vertices.length ||
          i3 >= vertices.length
        ) {
          console.warn(`Skipping out-of-bounds face ${i}:`, i1, i2, i3);
          continue;
        }

        const v1 = vertices[i1];
        const v2 = vertices[i2];
        const v3 = vertices[i3];

        const area = new Triangle(v1, v2, v3).getArea();
        if (!isFinite(area) || area === 0) continue;

        if (![v1, v2, v3].every((v) => Number.isFinite(v.x + v.y + v.z)))
          continue;

        positions.push(...v1.toArray(), ...v3.toArray(), ...v2.toArray());

        const textureId = this.modelDef.faceTextures?.[i] ?? -1;

        if (
          textureId !== -1 &&
          this.modelDef.faceTextureUCoordinates &&
          this.modelDef.faceTextureVCoordinates
        ) {
          const u = this.modelDef.faceTextureUCoordinates[i];
          const v = this.modelDef.faceTextureVCoordinates[i];

          const fixUv = (n: number) => Math.max(0, Math.min(1, n));
          uvs.push(
            fixUv(u[0]),
            fixUv(v[0]),
            fixUv(u[2]),
            fixUv(v[2]),
            fixUv(u[1]),
            fixUv(v[1])
          );
        } else {
          const p = v1
            .clone()
            .add(v2)
            .add(v3)
            .multiplyScalar(1 / 3);
          const [uv1, uv3, uv2] = pmnToUV(v1, v2, v3, p, v2, v3);
          uvs.push(...uv1.toArray(), ...uv3.toArray(), ...uv2.toArray());
        }

        const colorValue = this.modelDef.faceColors?.[i] ?? 0;
        const [r, g, b] = applyRecolor(
          colorValue,
          // TODO: FIX
          this.modelDef?.recolorToFind ?? [],
          this.modelDef?.recolorToReplace ?? []
        );
        colors.push(r, g, b, r, g, b, r, g, b);

        if (!groups.has(textureId)) groups.set(textureId, []);
        const group = groups.get(textureId)!;
        group.push(vertexOffset, vertexOffset + 1, vertexOffset + 2);
        vertexOffset += 3;
      }

      geometry.setAttribute(
        "position",
        new Float32BufferAttribute(positions, 3)
      );
      geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
      geometry.setAttribute(
        "color",
        new Float32BufferAttribute(colors, 3)
      );

      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const allIndices: number[] = [];
      const materials: Material[] = [];
      let start = 0;

      for (const [textureId, groupIndices] of groups.entries()) {
        geometry.addGroup(start, groupIndices.length, materials.length);
        materials.push(getTextureMaterial(textureId));

        allIndices.push(...groupIndices);
        start += groupIndices.length;
      }

      geometry.setIndex(allIndices);

      const mesh = new Mesh(geometry, materials);

      const box = new Box3().setFromObject(mesh);
      // TODO: add back with keybind
     /*  const helper = new Box3Helper(box, new Color(0xff0000)); */

      const dotGeometry = new BufferGeometry();
      dotGeometry.setAttribute(
        "position",
        new Float32BufferAttribute(positions, 3)
      );


      while(rotation-- > 0) {
        mesh.rotateY(Math.PI / 2);
        /* helper.rotateY(Math.PI / 2); */
      }

    /*   model.add(helper); */
      model.add(mesh);
      model.rotation.x = Math.PI;
    }

    return model;
  }
}
