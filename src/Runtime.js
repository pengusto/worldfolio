/**
 * Folio 2019 by Bruno SIMON (MIT), with the recovered GitSkins profile adapter.
 * Application logic recovered from the published r164 runtime; third-party
 * implementations are imported from versioned packages, never copied below.
 * See SOURCE.md and docs/modernization.md for provenance and comparison gates.
 */
import {
  SphereGeometry,
  Vector2,
  LinearFilter,
  AxesHelper,
  CanvasTexture,
  DataTexture,
  Texture,
  BufferGeometry,
  UniformsLib,
  NearestFilter,
  Euler,
  Vector3,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  ArrowHelper,
  Color,
  Scene,
  MeshNormalMaterial,
  PlaneGeometry,
  Object3D,
  CylinderGeometry,
  BoxGeometry,
  BufferAttribute,
  DoubleSide,
  MeshBasicMaterial,
  ShaderMaterial,
  Float32BufferAttribute,
  WebGLRenderer,
} from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GUI } from "dat.gui";
import { gsap } from "gsap";
import CANNON from "cannon";
import { Howl, Howler } from "howler";
const ui = { Howl, Howler };
class EventEmitter {
  constructor() {
    ((this.callbacks = {}), (this.callbacks.base = {}));
  }
  on(e, t) {
    const n = this;
    return typeof e > "u" || e === ""
      ? (console.warn("wrong names"), !1)
      : typeof t > "u"
        ? (console.warn("wrong callback"), !1)
        : (this.resolveNames(e).forEach(function (s) {
            const r = n.resolveName(s);
            (n.callbacks[r.namespace] instanceof Object || (n.callbacks[r.namespace] = {}),
              n.callbacks[r.namespace][r.value] instanceof Array ||
                (n.callbacks[r.namespace][r.value] = []),
              n.callbacks[r.namespace][r.value].push(t));
          }),
          this);
  }
  off(e) {
    const t = this;
    return typeof e > "u" || e === ""
      ? (console.warn("wrong name"), !1)
      : (this.resolveNames(e).forEach(function (i) {
          const s = t.resolveName(i);
          if (s.namespace !== "base" && s.value === "") delete t.callbacks[s.namespace];
          else if (s.namespace === "base")
            for (const r in t.callbacks)
              t.callbacks[r] instanceof Object &&
                t.callbacks[r][s.value] instanceof Array &&
                (delete t.callbacks[r][s.value],
                Object.keys(t.callbacks[r]).length === 0 && delete t.callbacks[r]);
          else
            t.callbacks[s.namespace] instanceof Object &&
              t.callbacks[s.namespace][s.value] instanceof Array &&
              (delete t.callbacks[s.namespace][s.value],
              Object.keys(t.callbacks[s.namespace]).length === 0 &&
                delete t.callbacks[s.namespace]);
        }),
        this);
  }
  trigger(e, t) {
    if (typeof e > "u" || e === "") return (console.warn("wrong name"), !1);
    const n = this;
    let i = null;
    const s = t instanceof Array ? t : [];
    let r = this.resolveNames(e);
    if (((r = this.resolveName(r[0])), r.namespace === "base"))
      for (const a in n.callbacks)
        n.callbacks[a] instanceof Object &&
          n.callbacks[a][r.value] instanceof Array &&
          n.callbacks[a][r.value].forEach(function (c) {
            c.apply(n, s);
          });
    else if (this.callbacks[r.namespace] instanceof Object) {
      if (r.value === "") return (console.warn("wrong name"), this);
      n.callbacks[r.namespace][r.value].forEach(function (a) {
        a.apply(n, s);
      });
    }
    return i;
  }
  resolveNames(e) {
    let t = e;
    return (
      (t = t.replace(/[^a-zA-Z0-9 ,/.]/g, "")),
      (t = t.replace(/[,/]+/g, " ")),
      (t = t.split(" ")),
      t
    );
  }
  resolveName(e) {
    const t = {},
      n = e.split(".");
    return (
      (t.original = e),
      (t.value = n[0]),
      (t.namespace = "base"),
      n.length > 1 && n[1] !== "" && (t.namespace = n[1]),
      t
    );
  }
}
class Sizes extends EventEmitter {
  constructor() {
    (super(),
      (this.viewport = {}),
      (this.$sizeViewport = document.createElement("div")),
      (this.$sizeViewport.style.width = "100vw"),
      (this.$sizeViewport.style.height = "100vh"),
      (this.$sizeViewport.style.position = "absolute"),
      (this.$sizeViewport.style.top = 0),
      (this.$sizeViewport.style.left = 0),
      (this.$sizeViewport.style.pointerEvents = "none"),
      (this.resize = this.resize.bind(this)),
      window.addEventListener("resize", this.resize),
      this.resize());
  }
  resize() {
    (document.body.appendChild(this.$sizeViewport),
      (this.viewport.width = this.$sizeViewport.offsetWidth),
      (this.viewport.height = this.$sizeViewport.offsetHeight),
      document.body.removeChild(this.$sizeViewport),
      (this.width = window.innerWidth),
      (this.height = window.innerHeight),
      this.trigger("resize"));
  }
}
class Time extends EventEmitter {
  constructor() {
    (super(),
      (this.start = Date.now()),
      (this.current = this.start),
      (this.elapsed = 0),
      (this.delta = 16),
      (this.tick = this.tick.bind(this)),
      this.tick());
  }
  tick() {
    this.ticker = window.requestAnimationFrame(this.tick);
    const e = Date.now();
    ((this.delta = e - this.current),
      (this.elapsed = e - this.start),
      (this.current = e),
      this.delta > 60 && (this.delta = 60),
      this.trigger("tick"));
  }
  stop() {
    window.cancelAnimationFrame(this.ticker);
  }
}
var floorShadowFragment = `uniform sampler2D tShadow;
uniform vec3 uShadowColor;
uniform float uAlpha;

varying vec2 vUv;

void main()
{
    float shadowAlpha = 1.0 - texture2D(tShadow, vUv).r;
    shadowAlpha *= uAlpha;

    gl_FragColor = vec4(uShadowColor, shadowAlpha);
}`,
  floorShadowVertex = `varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
function createFloorShadowMaterial() {
  const o = { tShadow: { value: null }, uShadowColor: { value: null }, uAlpha: { value: null } };
  return new ShaderMaterial({
    wireframe: !1,
    transparent: !0,
    uniforms: o,
    vertexShader: floorShadowVertex,
    fragmentShader: floorShadowFragment,
  });
}
var matcapFragment = `#define TOTO
#define MATCAP
#define USE_MATCAP

uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;

varying vec3 vViewPosition;

uniform mat3 normalMatrix;
uniform float uIndirectDistanceAmplitude;
uniform float uIndirectDistanceStrength;
uniform float uIndirectDistancePower;
uniform float uIndirectAngleStrength;
uniform float uIndirectAngleOffset;
uniform float uIndirectAnglePower;
uniform vec3 uIndirectColor;

varying vec3 vWorldPosition;

#ifndef FLAT_SHADED

    varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>

#include <fog_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

    if(vWorldPosition.z < 0.0)
    {
        discard;
    }

    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4( diffuse, opacity );

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>

    vec3 viewDir = normalize( vViewPosition );
    vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
    vec3 y = cross( viewDir, x );
    vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

    #ifdef USE_MATCAP

        vec4 matcapColor = texture2D( matcap, uv );


    #else

        vec4 matcapColor = vec4( 1.0 );

    #endif

    vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;


    float indirectDistanceStrength = clamp(1.0 - vWorldPosition.z / uIndirectDistanceAmplitude, 0.0, 1.0) * uIndirectDistanceStrength;
    indirectDistanceStrength = pow(indirectDistanceStrength, uIndirectDistancePower);
    indirectDistanceStrength = clamp(indirectDistanceStrength, 0.0, 1.0);

    vec3 worldNormal = inverseTransformDirection(vNormal, viewMatrix);

    float indirectAngleStrength = dot(normalize(worldNormal), vec3(0.0, 0.0, - 1.0)) + uIndirectAngleOffset;
    indirectAngleStrength = clamp(indirectAngleStrength * uIndirectAngleStrength, 0.0, 1.0);
    indirectAngleStrength = pow(indirectAngleStrength, uIndirectAnglePower);


    float indirectStrength = indirectDistanceStrength * indirectAngleStrength;





    gl_FragColor = vec4(mix(outgoingLight, uIndirectColor, indirectStrength), diffuseColor.a);


	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,
  matcapVertex = `#define TOTO
#define MATCAP
#define USE_MATCAP

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

    varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>

#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

uniform float uRevealProgress;

varying vec3 vWorldPosition;

#define M_PI 3.1415926535897932384626433832795

float easeSin(float _value)
{
    return sin((_value - 0.5) * M_PI) * 0.5 + 0.5;
}

void main() {

    #include <uv_vertex>

    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>

    #ifndef FLAT_SHADED

        vNormal = normalize( transformedNormal );

    #endif

    #include <begin_vertex>
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>


    vec4 worldNormal = modelMatrix * vec4(normal, 1.0);

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);


    float distanceToCenter = length(worldPosition);
    float zAmplitude = 3.2;
    float revealProgress = (uRevealProgress - distanceToCenter / 30.0) * 5.0;
    revealProgress = 1.0 - clamp(revealProgress, - 0.1, 1.0);
    revealProgress = pow(revealProgress, 2.0);
    if(uRevealProgress > 0.9)
    {
        revealProgress = 0.0;
    }
    worldPosition.z -= revealProgress * zAmplitude;


    vWorldPosition = worldPosition.xyz;

    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;




    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    #include <fog_vertex>

    vViewPosition = - mvPosition.xyz;

}`;
function createMatcapMaterial() {
  const o = {
      ...UniformsLib.common,
      ...UniformsLib.bumpmap,
      ...UniformsLib.normalmap,
      ...UniformsLib.displacementmap,
      ...UniformsLib.fog,
      matcap: { value: null },
      uRevealProgress: { value: null },
      uIndirectDistanceAmplitude: { value: null },
      uIndirectDistanceStrength: { value: null },
      uIndirectDistancePower: { value: null },
      uIndirectAngleStrength: { value: null },
      uIndirectAngleOffset: { value: null },
      uIndirectAnglePower: { value: null },
      uIndirectColor: { value: null },
    },
    e = { derivatives: !1, fragDepth: !1, drawBuffers: !1, shaderTextureLOD: !1 },
    t = { MATCAP: "" };
  return new ShaderMaterial({
    wireframe: !1,
    transparent: !1,
    uniforms: o,
    extensions: e,
    defines: t,
    lights: !1,
    vertexShader: matcapVertex,
    fragmentShader: matcapFragment,
  });
}
class Materials {
  constructor(e) {
    ((this.resources = e.resources),
      (this.debug = e.debug),
      this.debug &&
        ((this.debugFolder = this.debug.addFolder("materials")), this.debugFolder.open()),
      (this.items = {}),
      this.setPures(),
      this.setShades(),
      this.setFloorShadow());
  }
  setPures() {
    ((this.pures = {}),
      (this.pures.items = {}),
      (this.pures.items.red = new MeshBasicMaterial({ color: 16711680 })),
      (this.pures.items.red.name = "pureRed"),
      (this.pures.items.white = new MeshBasicMaterial({ color: 16777215 })),
      (this.pures.items.white.name = "pureWhite"),
      (this.pures.items.yellow = new MeshBasicMaterial({ color: 16771209 })),
      (this.pures.items.yellow.name = "pureYellow"));
  }
  setShades() {
    if (
      ((this.shades = {}),
      (this.shades.items = {}),
      (this.shades.indirectColor = "#d04500"),
      (this.shades.uniforms = {
        uRevealProgress: 0,
        uIndirectDistanceAmplitude: 1.75,
        uIndirectDistanceStrength: 0.5,
        uIndirectDistancePower: 2,
        uIndirectAngleStrength: 1.5,
        uIndirectAngleOffset: 0.6,
        uIndirectAnglePower: 1,
        uIndirectColor: null,
      }),
      (this.shades.items.white = new createMatcapMaterial()),
      (this.shades.items.white.name = "shadeWhite"),
      (this.shades.items.white.uniforms.matcap.value = this.resources.items.matcapWhiteTexture),
      (this.items.white = this.shades.items.white),
      (this.shades.items.orange = new createMatcapMaterial()),
      (this.shades.items.orange.name = "shadeOrange"),
      (this.shades.items.orange.uniforms.matcap.value = this.resources.items.matcapOrangeTexture),
      (this.items.orange = this.shades.items.orange),
      (this.shades.items.green = new createMatcapMaterial()),
      (this.shades.items.green.name = "shadeGreen"),
      (this.shades.items.green.uniforms.matcap.value = this.resources.items.matcapGreenTexture),
      (this.items.green = this.shades.items.green),
      (this.shades.items.brown = new createMatcapMaterial()),
      (this.shades.items.brown.name = "shadeBrown"),
      (this.shades.items.brown.uniforms.matcap.value = this.resources.items.matcapBrownTexture),
      (this.items.brown = this.shades.items.brown),
      (this.shades.items.gray = new createMatcapMaterial()),
      (this.shades.items.gray.name = "shadeGray"),
      (this.shades.items.gray.uniforms.matcap.value = this.resources.items.matcapGrayTexture),
      (this.items.gray = this.shades.items.gray),
      (this.shades.items.beige = new createMatcapMaterial()),
      (this.shades.items.beige.name = "shadeBeige"),
      (this.shades.items.beige.uniforms.matcap.value = this.resources.items.matcapBeigeTexture),
      (this.items.beige = this.shades.items.beige),
      (this.shades.items.red = new createMatcapMaterial()),
      (this.shades.items.red.name = "shadeRed"),
      (this.shades.items.red.uniforms.matcap.value = this.resources.items.matcapRedTexture),
      (this.items.red = this.shades.items.red),
      (this.shades.items.black = new createMatcapMaterial()),
      (this.shades.items.black.name = "shadeBlack"),
      (this.shades.items.black.uniforms.matcap.value = this.resources.items.matcapBlackTexture),
      (this.items.black = this.shades.items.black),
      (this.shades.items.emeraldGreen = new createMatcapMaterial()),
      (this.shades.items.emeraldGreen.name = "shadeEmeraldGreen"),
      (this.shades.items.emeraldGreen.uniforms.matcap.value =
        this.resources.items.matcapEmeraldGreenTexture),
      (this.items.emeraldGreen = this.shades.items.emeraldGreen),
      (this.shades.items.purple = new createMatcapMaterial()),
      (this.shades.items.purple.name = "shadePurple"),
      (this.shades.items.purple.uniforms.matcap.value = this.resources.items.matcapPurpleTexture),
      (this.items.purple = this.shades.items.purple),
      (this.shades.items.blue = new createMatcapMaterial()),
      (this.shades.items.blue.name = "shadeBlue"),
      (this.shades.items.blue.uniforms.matcap.value = this.resources.items.matcapBlueTexture),
      (this.items.blue = this.shades.items.blue),
      (this.shades.items.yellow = new createMatcapMaterial()),
      (this.shades.items.yellow.name = "shadeYellow"),
      (this.shades.items.yellow.uniforms.matcap.value = this.resources.items.matcapYellowTexture),
      (this.items.yellow = this.shades.items.yellow),
      (this.shades.items.metal = new createMatcapMaterial()),
      (this.shades.items.metal.name = "shadeMetal"),
      (this.shades.items.metal.uniforms.matcap.value = this.resources.items.matcapMetalTexture),
      (this.items.metal = this.shades.items.metal),
      (this.shades.updateMaterials = () => {
        this.shades.uniforms.uIndirectColor = new Color(this.shades.indirectColor);
        for (const e in this.shades.uniforms) {
          const t = this.shades.uniforms[e];
          for (const n in this.shades.items) {
            const i = this.shades.items[n];
            i.uniforms[e].value = t;
          }
        }
      }),
      this.shades.updateMaterials(),
      this.debug)
    ) {
      const e = this.debugFolder.addFolder("shades");
      (e.open(),
        e
          .add(this.shades.uniforms, "uIndirectDistanceAmplitude")
          .step(0.001)
          .min(0)
          .max(3)
          .onChange(this.shades.updateMaterials),
        e
          .add(this.shades.uniforms, "uIndirectDistanceStrength")
          .step(0.001)
          .min(0)
          .max(2)
          .onChange(this.shades.updateMaterials),
        e
          .add(this.shades.uniforms, "uIndirectDistancePower")
          .step(0.001)
          .min(0)
          .max(5)
          .onChange(this.shades.updateMaterials),
        e
          .add(this.shades.uniforms, "uIndirectAngleStrength")
          .step(0.001)
          .min(0)
          .max(2)
          .onChange(this.shades.updateMaterials),
        e
          .add(this.shades.uniforms, "uIndirectAngleOffset")
          .step(0.001)
          .min(-2)
          .max(2)
          .onChange(this.shades.updateMaterials),
        e
          .add(this.shades.uniforms, "uIndirectAnglePower")
          .step(0.001)
          .min(0)
          .max(5)
          .onChange(this.shades.updateMaterials),
        e.addColor(this.shades, "indirectColor").onChange(this.shades.updateMaterials));
    }
  }
  setFloorShadow() {
    if (
      ((this.items.floorShadow = new createFloorShadowMaterial()),
      (this.items.floorShadow.depthWrite = !1),
      (this.items.floorShadow.shadowColor = "#d04500"),
      (this.items.floorShadow.uniforms.uShadowColor.value = new Color(
        this.items.floorShadow.shadowColor,
      )),
      (this.items.floorShadow.uniforms.uAlpha.value = 0),
      (this.items.floorShadow.updateMaterials = () => {
        this.items.floorShadow.uniforms.uShadowColor.value = new Color(
          this.items.floorShadow.shadowColor,
        );
        for (const e of this.objects.items)
          for (const t of e.container.children)
            t.material instanceof ShaderMaterial &&
              t.material.uniforms.uShadowColor &&
              (t.material.uniforms.uShadowColor.value = new Color(
                this.items.floorShadow.shadowColor,
              ));
      }),
      this.debug)
    ) {
      const e = this.debugFolder.addFolder("floorShadow");
      (e.open(),
        e
          .addColor(this.items.floorShadow, "shadowColor")
          .onChange(this.items.floorShadow.updateMaterials));
    }
  }
}
var floorFragment = `uniform sampler2D tBackground;

varying vec2 vUv;

void main()
{
    vec4 backgroundColor = texture(tBackground, vUv);
    gl_FragColor = backgroundColor;
}`,
  floorVertex = `varying vec2 vUv;

void main()
{
    vUv = uv;

    vec3 newPosition = position;
    newPosition.z = 1.0;
    gl_Position = vec4(newPosition, 1.0);
}`;
function createFloorMaterial() {
  const o = { tBackground: { value: null } };
  return new ShaderMaterial({
    wireframe: !1,
    transparent: !1,
    uniforms: o,
    vertexShader: floorVertex,
    fragmentShader: floorFragment,
  });
}
class Floor {
  constructor(e) {
    if (
      ((this.debug = e.debug),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      (this.geometry = new PlaneGeometry(2, 2, 10, 10)),
      (this.colors = {}),
      (this.colors.topLeft = "#f5883c"),
      (this.colors.topRight = "#ff9043"),
      (this.colors.bottomRight = "#fccf92"),
      (this.colors.bottomLeft = "#f5aa58"),
      (this.material = new createFloorMaterial()),
      (this.updateMaterial = () => {
        const t = new Color(this.colors.topLeft),
          n = new Color(this.colors.topRight),
          i = new Color(this.colors.bottomRight),
          s = new Color(this.colors.bottomLeft);
        (t.convertLinearToSRGB(),
          n.convertLinearToSRGB(),
          i.convertLinearToSRGB(),
          s.convertLinearToSRGB());
        const r = new Uint8Array([
          Math.round(s.r * 255),
          Math.round(s.g * 255),
          Math.round(s.b * 255),
          255,
          Math.round(i.r * 255),
          Math.round(i.g * 255),
          Math.round(i.b * 255),
          255,
          Math.round(t.r * 255),
          Math.round(t.g * 255),
          Math.round(t.b * 255),
          255,
          Math.round(n.r * 255),
          Math.round(n.g * 255),
          Math.round(n.b * 255),
          255,
        ]);
        ((this.backgroundTexture = new DataTexture(r, 2, 2)),
          (this.backgroundTexture.magFilter = LinearFilter),
          (this.backgroundTexture.needsUpdate = !0),
          (this.material.uniforms.tBackground.value = this.backgroundTexture));
      }),
      this.updateMaterial(),
      (this.mesh = new Mesh(this.geometry, this.material)),
      (this.mesh.frustumCulled = !1),
      (this.mesh.matrixAutoUpdate = !1),
      this.mesh.updateMatrix(),
      this.container.add(this.mesh),
      this.debug)
    ) {
      const t = this.debug.addFolder("floor");
      (t.addColor(this.colors, "topLeft").onChange(this.updateMaterial),
        t.addColor(this.colors, "topRight").onChange(this.updateMaterial),
        t.addColor(this.colors, "bottomRight").onChange(this.updateMaterial),
        t.addColor(this.colors, "bottomLeft").onChange(this.updateMaterial));
    }
  }
}
var shadowFragment = `#define PI 3.141592653589793

uniform vec3 uColor;
uniform float uAlpha;
uniform float uFadeRadius;

varying vec2 vUv;

float sineInOut(float t)
{
    return - 0.5 * (cos(PI * t) - 1.0);
}

void main()
{
    float strength = 0.0;

    if(vUv.x < uFadeRadius && vUv.y < uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else if(vUv.x > 1.0 - uFadeRadius && vUv.y < uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(1.0 - uFadeRadius, uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else if(vUv.x > 1.0 - uFadeRadius && vUv.y > 1.0 - uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(1.0 - uFadeRadius, 1.0 - uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else if(vUv.x < uFadeRadius && vUv.y > 1.0 - uFadeRadius)
    {
        strength = clamp(1.0 - distance(vUv, vec2(uFadeRadius, 1.0 - uFadeRadius)) / uFadeRadius, 0.0, 1.0);
    }

    else
    {
        float xNeg = clamp(vUv.x / uFadeRadius, 0.0, 1.0);
        float xPos = clamp((1.0 - vUv.x) / uFadeRadius, 0.0, 1.0);
        float yNeg = clamp(vUv.y / uFadeRadius, 0.0, 1.0);
        float yPos = clamp((1.0 - vUv.y) / uFadeRadius, 0.0, 1.0);

        strength = xNeg * xPos * yNeg * yPos;
    }

    strength = sineInOut(strength);
    strength *= uAlpha;

    gl_FragColor = vec4(uColor, strength);
	#include <colorspace_fragment>
}`,
  shadowVertex = `varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
function createShadowMaterial() {
  const o = { uColor: { value: null }, uAlpha: { value: null }, uFadeRadius: { value: null } };
  return new ShaderMaterial({
    wireframe: !1,
    transparent: !0,
    uniforms: o,
    vertexShader: shadowVertex,
    fragmentShader: shadowFragment,
  });
}
class Shadows {
  constructor(e) {
    ((this.time = e.time),
      (this.debug = e.debug),
      (this.renderer = e.renderer),
      (this.camera = e.camera),
      (this.alpha = 0),
      (this.maxDistance = 3),
      (this.distancePower = 2),
      (this.zFightingDistance = 0.001),
      (this.color = "#d04500"),
      (this.wireframeVisible = !1),
      (this.items = []),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.container.updateMatrix(),
      this.debug &&
        ((this.debugFolder = this.debug.addFolder("shadows")),
        this.debugFolder.add(this, "alpha").step(0.01).min(0).max(1),
        this.debugFolder.add(this, "maxDistance").step(0.01).min(0).max(10),
        this.debugFolder.add(this, "distancePower").step(0.01).min(1).max(5),
        this.debugFolder
          .add(this, "wireframeVisible")
          .name("wireframeVisible")
          .onChange(() => {
            for (const t of this.items)
              t.mesh.material = this.wireframeVisible ? this.materials.wireframe : t.material;
          }),
        this.debugFolder.addColor(this, "color").onChange(() => {
          this.materials.base.uniforms.uColor.value = new Color(this.color);
          for (const t of this.items) t.material.uniforms.uColor.value = new Color(this.color);
        })),
      this.setSun(),
      this.setMaterials(),
      this.setGeometry(),
      this.setHelper(),
      this.time.on("tick", () => {
        for (const t of this.items) {
          const n = Math.max(t.reference.position.z + t.offsetZ, 0),
            i = this.sun.vector.clone().multiplyScalar(n);
          ((t.mesh.position.x = t.reference.position.x + i.x),
            (t.mesh.position.y = t.reference.position.y + i.y));
          const s = new Vector3(1, 0, 0);
          s.applyQuaternion(t.reference.quaternion);
          const r = s.clone().projectOnPlane(new Vector3(0, 0, 1));
          let a = Math.abs(s.angleTo(new Vector3(0, 0, 1)) - Math.PI * 0.5) / (Math.PI * 0.5);
          ((a /= 0.5), (a -= 1 / 0.5), (a = Math.abs(a)), (a = Math.min(Math.max(a, 0), 1)));
          const c = Math.atan2(r.y, r.x);
          t.mesh.rotation.z = c;
          let u = (this.maxDistance - n) / this.maxDistance;
          ((u = Math.min(Math.max(u, 0), 1)),
            (u = Math.pow(u, this.distancePower)),
            (t.material.uniforms.uAlpha.value = this.alpha * t.alpha * a * u));
        }
      }));
  }
  setSun() {
    if (
      ((this.sun = {}),
      (this.sun.position = new Vector3(-2.5, -2.65, 3.75)),
      (this.sun.vector = new Vector3()),
      (this.sun.helper = new ArrowHelper(
        new Vector3(0, 0, 1),
        new Vector3(0, 0, 0),
        1,
        16777215,
        0.1,
        0.4,
      )),
      (this.sun.helper.visible = !1),
      this.container.add(this.sun.helper),
      (this.sun.update = () => {
        (this.sun.vector
          .copy(this.sun.position)
          .multiplyScalar(1 / this.sun.position.z)
          .negate(),
          this.sun.helper.position.copy(this.sun.position));
        const e = this.sun.position.clone().negate().normalize();
        (this.sun.helper.setDirection(e),
          this.sun.helper.setLength(this.sun.helper.position.length()));
      }),
      this.sun.update(),
      this.debug)
    ) {
      const e = this.debugFolder.addFolder("sun");
      (e.open(),
        e
          .add(this.sun.position, "x")
          .step(0.01)
          .min(-10)
          .max(10)
          .name("sunX")
          .onChange(this.sun.update),
        e
          .add(this.sun.position, "y")
          .step(0.01)
          .min(-10)
          .max(10)
          .name("sunY")
          .onChange(this.sun.update),
        e
          .add(this.sun.position, "z")
          .step(0.01)
          .min(0)
          .max(10)
          .name("sunZ")
          .onChange(this.sun.update),
        e.add(this.sun.helper, "visible").name("sunHelperVisible"));
    }
  }
  setMaterials() {
    ((this.materials = {}),
      (this.materials.wireframe = new MeshBasicMaterial({ color: 16777215, wireframe: !0 })),
      (this.materials.base = new createShadowMaterial()),
      (this.materials.base.depthWrite = !1),
      (this.materials.base.uniforms.uColor.value = new Color(this.color)),
      (this.materials.base.uniforms.uAlpha.value = 0),
      (this.materials.base.uniforms.uFadeRadius.value = 0.35));
  }
  setGeometry() {
    this.geometry = new PlaneGeometry(1, 1, 1, 1);
  }
  setHelper() {
    if (
      this.debug &&
      ((this.helper = {}),
      (this.helper.active = !1),
      (this.helper.mesh = new Mesh(new BoxGeometry(3, 1, 1, 1), new MeshNormalMaterial())),
      (this.helper.mesh.position.z = 1.5),
      (this.helper.mesh.position.y = -3),
      (this.helper.mesh.visible = this.helper.active),
      this.container.add(this.helper.mesh),
      (this.helper.transformControls = new TransformControls(
        this.camera.instance,
        this.renderer.domElement,
      )),
      (this.helper.transformControlsHelper = this.helper.transformControls.getHelper()),
      (this.helper.transformControls.size = 0.5),
      this.helper.transformControls.attach(this.helper.mesh),
      (this.helper.transformControlsHelper.visible = this.helper.active),
      (this.helper.transformControls.enabled = this.helper.active),
      (this.helper.shadow = this.add(this.helper.mesh, {
        sizeX: 6,
        sizeY: 2,
        offsetZ: -0.35,
        alpha: 0.99,
      })),
      (this.helper.shadow.mesh.visible = this.helper.active),
      document.addEventListener("keydown", (e) => {
        e.key === "r"
          ? this.helper.transformControls.setMode("rotate")
          : e.key === "g" && this.helper.transformControls.setMode("translate");
      }),
      this.helper.transformControls.addEventListener("dragging-changed", (e) => {
        this.camera.orbitControls.enabled = !e.value;
      }),
      this.container.add(this.helper.transformControlsHelper),
      this.debug)
    ) {
      const e = this.debugFolder.addFolder("helper");
      (e.open(),
        e
          .add(this.helper, "active")
          .name("visible")
          .onChange(() => {
            ((this.helper.mesh.visible = this.helper.active),
              (this.helper.transformControlsHelper.visible = this.helper.active),
              (this.helper.transformControls.enabled = this.helper.active),
              (this.helper.shadow.mesh.visible = this.helper.active));
          }));
    }
  }
  add(e, t = {}) {
    const n = {};
    return (
      (n.offsetZ = typeof t.offsetZ > "u" ? 0 : t.offsetZ),
      (n.alpha = typeof t.alpha > "u" ? 1 : t.alpha),
      (n.reference = e),
      (n.material = this.materials.base.clone()),
      (n.mesh = new Mesh(
        this.geometry,
        this.wireframeVisible ? this.materials.wireframe : n.material,
      )),
      (n.mesh.position.z = this.zFightingDistance),
      n.mesh.scale.set(t.sizeX, t.sizeY, 2.4),
      this.container.add(n.mesh),
      this.items.push(n),
      n
    );
  }
}
class Physics {
  constructor(e) {
    ((this.config = e.config),
      (this.debug = e.debug),
      (this.time = e.time),
      (this.sizes = e.sizes),
      (this.controls = e.controls),
      (this.sounds = e.sounds),
      this.debug && (this.debugFolder = this.debug.addFolder("physics")),
      this.setWorld(),
      this.setModels(),
      this.setMaterials(),
      this.setFloor(),
      this.setCar(),
      this.time.on("tick", () => {
        this.world.step(this.time.delta / 1e3);
      }));
  }
  setWorld() {
    ((this.world = new CANNON.World()),
      this.world.gravity.set(0, 0, -3.25 * 4),
      (this.world.allowSleep = !0),
      (this.world.defaultContactMaterial.friction = 0),
      (this.world.defaultContactMaterial.restitution = 0.2),
      this.debug &&
        this.debugFolder.add(this.world.gravity, "z").step(0.001).min(-20).max(20).name("gravity"));
  }
  setModels() {
    ((this.models = {}),
      (this.models.container = new Object3D()),
      (this.models.container.visible = !1),
      (this.models.materials = {}),
      (this.models.materials.static = new MeshBasicMaterial({ color: 255, wireframe: !0 })),
      (this.models.materials.dynamic = new MeshBasicMaterial({ color: 16711680, wireframe: !0 })),
      (this.models.materials.dynamicSleeping = new MeshBasicMaterial({
        color: 16776960,
        wireframe: !0,
      })),
      this.debug && this.debugFolder.add(this.models.container, "visible").name("modelsVisible"));
  }
  setMaterials() {
    ((this.materials = {}),
      (this.materials.items = {}),
      (this.materials.items.floor = new CANNON.Material("floorMaterial")),
      (this.materials.items.dummy = new CANNON.Material("dummyMaterial")),
      (this.materials.items.wheel = new CANNON.Material("wheelMaterial")),
      (this.materials.contacts = {}),
      (this.materials.contacts.floorDummy = new CANNON.ContactMaterial(
        this.materials.items.floor,
        this.materials.items.dummy,
        { friction: 0.05, restitution: 0.3, contactEquationStiffness: 1e3 },
      )),
      this.world.addContactMaterial(this.materials.contacts.floorDummy),
      (this.materials.contacts.dummyDummy = new CANNON.ContactMaterial(
        this.materials.items.dummy,
        this.materials.items.dummy,
        { friction: 0.5, restitution: 0.3, contactEquationStiffness: 1e3 },
      )),
      this.world.addContactMaterial(this.materials.contacts.dummyDummy),
      (this.materials.contacts.floorWheel = new CANNON.ContactMaterial(
        this.materials.items.floor,
        this.materials.items.wheel,
        { friction: 0.3, restitution: 0, contactEquationStiffness: 1e3 },
      )),
      this.world.addContactMaterial(this.materials.contacts.floorWheel));
  }
  setFloor() {
    ((this.floor = {}),
      (this.floor.body = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Plane(),
        material: this.materials.items.floor,
      })),
      this.world.addBody(this.floor.body));
  }
  setCar() {
    ((this.car = {}),
      (this.car.steering = 0),
      (this.car.accelerating = 0),
      (this.car.speed = 0),
      (this.car.worldForward = new CANNON.Vec3()),
      (this.car.angle = 0),
      (this.car.forwardSpeed = 0),
      (this.car.oldPosition = new CANNON.Vec3()),
      (this.car.goingForward = !0),
      (this.car.options = {}),
      (this.car.options.chassisWidth = 1.02),
      (this.car.options.chassisHeight = 1.16),
      (this.car.options.chassisDepth = 2.03),
      (this.car.options.chassisOffset = new CANNON.Vec3(0, 0, 0.41)),
      (this.car.options.chassisMass = 40),
      (this.car.options.wheelFrontOffsetDepth = 0.635),
      (this.car.options.wheelBackOffsetDepth = -0.475),
      (this.car.options.wheelOffsetWidth = 0.39),
      (this.car.options.wheelRadius = 0.25),
      (this.car.options.wheelHeight = 0.24),
      (this.car.options.wheelSuspensionStiffness = 50),
      (this.car.options.wheelSuspensionRestLength = 0.1),
      (this.car.options.wheelFrictionSlip = 10),
      (this.car.options.wheelDampingRelaxation = 1.8),
      (this.car.options.wheelDampingCompression = 1.5),
      (this.car.options.wheelMaxSuspensionForce = 1e5),
      (this.car.options.wheelRollInfluence = 0.01),
      (this.car.options.wheelMaxSuspensionTravel = 0.3),
      (this.car.options.wheelCustomSlidingRotationalSpeed = -30),
      (this.car.options.wheelMass = 5),
      (this.car.options.controlsSteeringSpeed = 0.005 * 3),
      (this.car.options.controlsSteeringMax = Math.PI * 0.17),
      (this.car.options.controlsSteeringQuad = !1),
      (this.car.options.controlsAcceleratinMaxSpeed = (0.055 * 3) / 17),
      (this.car.options.controlsAcceleratinMaxSpeedBoost = (0.11 * 3) / 17),
      (this.car.options.controlsAcceleratingSpeed = 2 * 4 * 2),
      (this.car.options.controlsAcceleratingSpeedBoost = 3.5 * 4 * 2),
      (this.car.options.controlsAcceleratingQuad = !0),
      (this.car.options.controlsBrakeStrength = 0.45 * 3),
      (this.car.upsideDown = {}),
      (this.car.upsideDown.state = "watching"),
      (this.car.upsideDown.pendingTimeout = null),
      (this.car.upsideDown.turningTimeout = null),
      (this.car.jump = (e = !0, t = 150) => {
        let n = this.car.chassis.body.position;
        ((n = n.vadd(new CANNON.Vec3(e ? 0.1 : 0, 0, 0))),
          this.car.chassis.body.applyImpulse(new CANNON.Vec3(0, 0, t), n));
      }),
      (this.car.create = () => {
        ((this.car.chassis = {}),
          (this.car.chassis.shape = new CANNON.Box(
            new CANNON.Vec3(
              this.car.options.chassisDepth * 0.5,
              this.car.options.chassisWidth * 0.5,
              this.car.options.chassisHeight * 0.5,
            ),
          )),
          (this.car.chassis.body = new CANNON.Body({ mass: this.car.options.chassisMass })),
          (this.car.chassis.body.allowSleep = !1),
          this.car.chassis.body.position.set(0, 0, 12),
          this.car.chassis.body.sleep(),
          this.car.chassis.body.addShape(this.car.chassis.shape, this.car.options.chassisOffset),
          this.car.chassis.body.quaternion.setFromAxisAngle(
            new CANNON.Vec3(0, 0, 1),
            -Math.PI * 0.5,
          ),
          this.car.chassis.body.addEventListener("collide", (t) => {
            if (t.body.mass === 0) {
              const n = t.contact.getImpactVelocityAlongNormal();
              this.sounds.play("carHit", n);
            }
          }),
          (this.car.vehicle = new CANNON.RaycastVehicle({ chassisBody: this.car.chassis.body })),
          (this.car.wheels = {}),
          (this.car.wheels.options = {
            radius: this.car.options.wheelRadius,
            height: this.car.options.wheelHeight,
            suspensionStiffness: this.car.options.wheelSuspensionStiffness,
            suspensionRestLength: this.car.options.wheelSuspensionRestLength,
            frictionSlip: this.car.options.wheelFrictionSlip,
            dampingRelaxation: this.car.options.wheelDampingRelaxation,
            dampingCompression: this.car.options.wheelDampingCompression,
            maxSuspensionForce: this.car.options.wheelMaxSuspensionForce,
            rollInfluence: this.car.options.wheelRollInfluence,
            maxSuspensionTravel: this.car.options.wheelMaxSuspensionTravel,
            customSlidingRotationalSpeed: this.car.options.wheelCustomSlidingRotationalSpeed,
            useCustomSlidingRotationalSpeed: !0,
            directionLocal: new CANNON.Vec3(0, 0, -1),
            axleLocal: new CANNON.Vec3(0, 1, 0),
            chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
          }),
          this.car.wheels.options.chassisConnectionPointLocal.set(
            this.car.options.wheelFrontOffsetDepth,
            this.car.options.wheelOffsetWidth,
            0,
          ),
          this.car.vehicle.addWheel(this.car.wheels.options),
          this.car.wheels.options.chassisConnectionPointLocal.set(
            this.car.options.wheelFrontOffsetDepth,
            -this.car.options.wheelOffsetWidth,
            0,
          ),
          this.car.vehicle.addWheel(this.car.wheels.options),
          this.car.wheels.options.chassisConnectionPointLocal.set(
            this.car.options.wheelBackOffsetDepth,
            this.car.options.wheelOffsetWidth,
            0,
          ),
          this.car.vehicle.addWheel(this.car.wheels.options),
          this.car.wheels.options.chassisConnectionPointLocal.set(
            this.car.options.wheelBackOffsetDepth,
            -this.car.options.wheelOffsetWidth,
            0,
          ),
          this.car.vehicle.addWheel(this.car.wheels.options),
          this.car.vehicle.addToWorld(this.world),
          (this.car.wheels.indexes = {}),
          (this.car.wheels.indexes.frontLeft = 0),
          (this.car.wheels.indexes.frontRight = 1),
          (this.car.wheels.indexes.backLeft = 2),
          (this.car.wheels.indexes.backRight = 3),
          (this.car.wheels.bodies = []));
        for (const t of this.car.vehicle.wheelInfos) {
          const n = new CANNON.Cylinder(t.radius, t.radius, this.car.wheels.options.height, 20),
            i = new CANNON.Body({
              mass: this.car.options.wheelMass,
              material: this.materials.items.wheel,
            }),
            s = new CANNON.Quaternion();
          (s.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2),
            (i.type = CANNON.Body.KINEMATIC),
            i.addShape(n, new CANNON.Vec3(), s),
            this.car.wheels.bodies.push(i));
        }
        ((this.car.model = {}),
          (this.car.model.container = new Object3D()),
          this.models.container.add(this.car.model.container),
          (this.car.model.material = new MeshBasicMaterial({ color: 16777215, wireframe: !0 })),
          (this.car.model.chassis = new Mesh(
            new BoxGeometry(
              this.car.options.chassisDepth,
              this.car.options.chassisWidth,
              this.car.options.chassisHeight,
            ),
            this.car.model.material,
          )),
          this.car.model.container.add(this.car.model.chassis),
          (this.car.model.wheels = []));
        const e = new CylinderGeometry(
          this.car.options.wheelRadius,
          this.car.options.wheelRadius,
          this.car.options.wheelHeight,
          8,
          1,
        );
        for (let t = 0; t < 4; t++) {
          const n = new Mesh(e, this.car.model.material);
          (this.car.model.container.add(n), this.car.model.wheels.push(n));
        }
      }),
      (this.car.destroy = () => {
        (this.car.vehicle.removeFromWorld(this.world),
          this.models.container.remove(this.car.model.container));
      }),
      (this.car.recreate = () => {
        (this.car.destroy(), this.car.create(), this.car.chassis.body.wakeUp());
      }),
      (this.car.brake = () => {
        (this.car.vehicle.setBrake(1, 0),
          this.car.vehicle.setBrake(1, 1),
          this.car.vehicle.setBrake(1, 2),
          this.car.vehicle.setBrake(1, 3));
      }),
      (this.car.unbrake = () => {
        (this.car.vehicle.setBrake(0, 0),
          this.car.vehicle.setBrake(0, 1),
          this.car.vehicle.setBrake(0, 2),
          this.car.vehicle.setBrake(0, 3));
      }),
      this.controls.on("action", (e) => {
        switch (e) {
          case "reset":
            this.car.recreate();
            break;
        }
      }),
      this.world.addEventListener("postStep", () => {
        let e = new CANNON.Vec3();
        ((e = e.copy(this.car.chassis.body.position)),
          (e = e.vsub(this.car.oldPosition)),
          this.car.oldPosition.copy(this.car.chassis.body.position),
          (this.car.speed = e.length() / this.time.delta));
        const t = new CANNON.Vec3(1, 0, 0);
        (this.car.chassis.body.vectorToWorldFrame(t, this.car.worldForward),
          (this.car.angle = Math.atan2(this.car.worldForward.y, this.car.worldForward.x)),
          (this.car.forwardSpeed = this.car.worldForward.dot(e)),
          (this.car.goingForward = this.car.forwardSpeed > 0));
        const n = new CANNON.Vec3(0, 0, 1),
          i = new CANNON.Vec3();
        (this.car.chassis.body.vectorToWorldFrame(n, i),
          i.dot(n) < 0.5
            ? this.car.upsideDown.state === "watching" &&
              ((this.car.upsideDown.state = "pending"),
              (this.car.upsideDown.pendingTimeout = window.setTimeout(() => {
                ((this.car.upsideDown.state = "turning"),
                  this.car.jump(!0),
                  (this.car.upsideDown.turningTimeout = window.setTimeout(() => {
                    this.car.upsideDown.state = "watching";
                  }, 1e3)));
              }, 1e3)))
            : this.car.upsideDown.state === "pending" &&
              ((this.car.upsideDown.state = "watching"),
              window.clearTimeout(this.car.upsideDown.pendingTimeout)));
        for (let s = 0; s < this.car.vehicle.wheelInfos.length; s++) {
          this.car.vehicle.updateWheelTransform(s);
          const r = this.car.vehicle.wheelInfos[s].worldTransform;
          if (
            (this.car.wheels.bodies[s].position.copy(r.position),
            this.car.wheels.bodies[s].quaternion.copy(r.quaternion),
            s === 1 || s === 3)
          ) {
            const a = new CANNON.Quaternion(0, 0, 0, 1);
            (a.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI),
              (this.car.wheels.bodies[s].quaternion =
                this.car.wheels.bodies[s].quaternion.mult(a)));
          }
        }
        if (!this.controls.actions.up && !this.controls.actions.down) {
          let s = this.car.worldForward.clone();
          (this.car.goingForward && (s = s.negate()),
            (s = s.scale(this.car.chassis.body.velocity.length() * 0.1)),
            this.car.chassis.body.applyImpulse(s, this.car.chassis.body.position));
        }
      }),
      this.time.on("tick", () => {
        (this.car.model.chassis.position
          .copy(this.car.chassis.body.position)
          .add(this.car.options.chassisOffset),
          this.car.model.chassis.quaternion.copy(this.car.chassis.body.quaternion));
        for (const i in this.car.wheels.bodies) {
          const s = this.car.wheels.bodies[i],
            r = this.car.model.wheels[i];
          (r.position.copy(s.position), r.quaternion.copy(s.quaternion));
        }
        if (this.controls.touch) {
          let i = 0;
          this.controls.touch.joystick.active &&
            ((i =
              ((this.controls.touch.joystick.angle.value - this.car.angle + Math.PI) %
                (Math.PI * 2)) -
              Math.PI),
            (i = i < -Math.PI ? i + Math.PI * 2 : i));
          const s = Math.abs(this.car.forwardSpeed) < 0.01 ? !0 : this.car.goingForward;
          ((this.car.steering = i * (s ? -1 : 1)),
            Math.abs(this.car.steering) > this.car.options.controlsSteeringMax &&
              (this.car.steering =
                Math.sign(this.car.steering) * this.car.options.controlsSteeringMax));
        }
        if (!this.controls.touch || !this.controls.touch.joystick.active) {
          const i = this.time.delta * this.car.options.controlsSteeringSpeed;
          (this.controls.actions.right
            ? (this.car.steering += i)
            : this.controls.actions.left
              ? (this.car.steering -= i)
              : Math.abs(this.car.steering) > i
                ? (this.car.steering -= i * Math.sign(this.car.steering))
                : (this.car.steering = 0),
            Math.abs(this.car.steering) > this.car.options.controlsSteeringMax &&
              (this.car.steering =
                Math.sign(this.car.steering) * this.car.options.controlsSteeringMax));
        }
        (this.car.vehicle.setSteeringValue(-this.car.steering, this.car.wheels.indexes.frontLeft),
          this.car.vehicle.setSteeringValue(-this.car.steering, this.car.wheels.indexes.frontRight),
          this.car.options.controlsSteeringQuad &&
            (this.car.vehicle.setSteeringValue(this.car.steering, this.car.wheels.indexes.backLeft),
            this.car.vehicle.setSteeringValue(
              this.car.steering,
              this.car.wheels.indexes.backRight,
            )));
        const t =
            17 *
            (this.controls.actions.boost
              ? this.car.options.controlsAcceleratingSpeedBoost
              : this.car.options.controlsAcceleratingSpeed),
          n = this.controls.actions.boost
            ? this.car.options.controlsAcceleratinMaxSpeedBoost
            : this.car.options.controlsAcceleratinMaxSpeed;
        (this.controls.actions.up
          ? this.car.speed < n || !this.car.goingForward
            ? (this.car.accelerating = t)
            : (this.car.accelerating = 0)
          : this.controls.actions.down
            ? this.car.speed < n || this.car.goingForward
              ? (this.car.accelerating = -t)
              : (this.car.accelerating = 0)
            : (this.car.accelerating = 0),
          this.car.vehicle.applyEngineForce(
            -this.car.accelerating,
            this.car.wheels.indexes.backLeft,
          ),
          this.car.vehicle.applyEngineForce(
            -this.car.accelerating,
            this.car.wheels.indexes.backRight,
          ),
          this.car.options.controlsSteeringQuad &&
            (this.car.vehicle.applyEngineForce(
              -this.car.accelerating,
              this.car.wheels.indexes.frontLeft,
            ),
            this.car.vehicle.applyEngineForce(
              -this.car.accelerating,
              this.car.wheels.indexes.frontRight,
            )),
          this.controls.actions.brake
            ? (this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 0),
              this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 1),
              this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 2),
              this.car.vehicle.setBrake(this.car.options.controlsBrakeStrength, 3))
            : (this.car.vehicle.setBrake(0, 0),
              this.car.vehicle.setBrake(0, 1),
              this.car.vehicle.setBrake(0, 2),
              this.car.vehicle.setBrake(0, 3)));
      }),
      this.car.create(),
      this.debug &&
        ((this.car.debugFolder = this.debugFolder.addFolder("car")),
        this.car.debugFolder.open(),
        this.car.debugFolder
          .add(this.car.options, "chassisWidth")
          .step(0.001)
          .min(0)
          .max(5)
          .name("chassisWidth")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "chassisHeight")
          .step(0.001)
          .min(0)
          .max(5)
          .name("chassisHeight")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "chassisDepth")
          .step(0.001)
          .min(0)
          .max(5)
          .name("chassisDepth")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options.chassisOffset, "z")
          .step(0.001)
          .min(0)
          .max(5)
          .name("chassisOffset")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "chassisMass")
          .step(0.001)
          .min(0)
          .max(1e3)
          .name("chassisMass")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelFrontOffsetDepth")
          .step(0.001)
          .min(0)
          .max(5)
          .name("wheelFrontOffsetDepth")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelBackOffsetDepth")
          .step(0.001)
          .min(-5)
          .max(0)
          .name("wheelBackOffsetDepth")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelOffsetWidth")
          .step(0.001)
          .min(0)
          .max(5)
          .name("wheelOffsetWidth")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelRadius")
          .step(0.001)
          .min(0)
          .max(2)
          .name("wheelRadius")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelHeight")
          .step(0.001)
          .min(0)
          .max(2)
          .name("wheelHeight")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelSuspensionStiffness")
          .step(0.001)
          .min(0)
          .max(300)
          .name("wheelSuspensionStiffness")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelSuspensionRestLength")
          .step(0.001)
          .min(0)
          .max(5)
          .name("wheelSuspensionRestLength")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelFrictionSlip")
          .step(0.001)
          .min(0)
          .max(30)
          .name("wheelFrictionSlip")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelDampingRelaxation")
          .step(0.001)
          .min(0)
          .max(30)
          .name("wheelDampingRelaxation")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelDampingCompression")
          .step(0.001)
          .min(0)
          .max(30)
          .name("wheelDampingCompression")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelMaxSuspensionForce")
          .step(0.001)
          .min(0)
          .max(1e6)
          .name("wheelMaxSuspensionForce")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelRollInfluence")
          .step(0.001)
          .min(0)
          .max(1)
          .name("wheelRollInfluence")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelMaxSuspensionTravel")
          .step(0.001)
          .min(0)
          .max(5)
          .name("wheelMaxSuspensionTravel")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelCustomSlidingRotationalSpeed")
          .step(0.001)
          .min(-45)
          .max(45)
          .name("wheelCustomSlidingRotationalSpeed")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "wheelMass")
          .step(0.001)
          .min(0)
          .max(1e3)
          .name("wheelMass")
          .onFinishChange(this.car.recreate),
        this.car.debugFolder
          .add(this.car.options, "controlsSteeringSpeed")
          .step(0.001)
          .min(0)
          .max(0.1)
          .name("controlsSteeringSpeed"),
        this.car.debugFolder
          .add(this.car.options, "controlsSteeringMax")
          .step(0.001)
          .min(0)
          .max(Math.PI * 0.5)
          .name("controlsSteeringMax"),
        this.car.debugFolder
          .add(this.car.options, "controlsSteeringQuad")
          .name("controlsSteeringQuad"),
        this.car.debugFolder
          .add(this.car.options, "controlsAcceleratingSpeed")
          .step(0.001)
          .min(0)
          .max(30)
          .name("controlsAcceleratingSpeed"),
        this.car.debugFolder
          .add(this.car.options, "controlsAcceleratingSpeedBoost")
          .step(0.001)
          .min(0)
          .max(30)
          .name("controlsAcceleratingSpeedBoost"),
        this.car.debugFolder
          .add(this.car.options, "controlsAcceleratingQuad")
          .name("controlsAcceleratingQuad"),
        this.car.debugFolder
          .add(this.car.options, "controlsBrakeStrength")
          .step(0.001)
          .min(0)
          .max(5)
          .name("controlsBrakeStrength"),
        this.car.debugFolder.add(this.car, "recreate"),
        this.car.debugFolder.add(this.car, "jump")));
  }
  addObjectFromThree(e) {
    const t = {};
    ((t.model = {}),
      (t.model.meshes = []),
      (t.model.container = new Object3D()),
      this.models.container.add(t.model.container),
      (t.children = []));
    const n = this.materials.items.dummy;
    if (
      ((t.body = new CANNON.Body({
        position: new CANNON.Vec3(e.offset.x, e.offset.y, e.offset.z),
        mass: e.mass,
        material: n,
      })),
      (t.body.allowSleep = !0),
      (t.body.sleepSpeedLimit = 0.01),
      e.sleep && t.body.sleep(),
      this.world.addBody(t.body),
      e.rotation)
    ) {
      const s = new CANNON.Quaternion();
      (s.setFromEuler(e.rotation.x, e.rotation.y, e.rotation.z, e.rotation.order),
        (t.body.quaternion = t.body.quaternion.mult(s)));
    }
    t.center = new CANNON.Vec3(0, 0, 0);
    const i = [];
    for (let s = 0; s < e.meshes.length; s++) {
      const r = e.meshes[s];
      let a = null;
      if (
        (r.name.match(/^cube_?[0-9]{0,3}?|box[0-9]{0,3}?$/i)
          ? (a = "box")
          : r.name.match(/^cylinder_?[0-9]{0,3}?$/i)
            ? (a = "cylinder")
            : r.name.match(/^sphere_?[0-9]{0,3}?$/i)
              ? (a = "sphere")
              : r.name.match(/^center_?[0-9]{0,3}?$/i) && (a = "center"),
        a === "center")
      )
        t.center.set(r.position.x, r.position.y, r.position.z);
      else if (a) {
        let c = null;
        if (a === "cylinder") c = new CANNON.Cylinder(r.scale.x, r.scale.x, r.scale.z, 8);
        else if (a === "box") {
          const f = new CANNON.Vec3(r.scale.x * 0.5, r.scale.y * 0.5, r.scale.z * 0.5);
          c = new CANNON.Box(f);
        } else a === "sphere" && (c = new CANNON.Sphere(r.scale.x));
        const u = new CANNON.Vec3(r.position.x, r.position.y, r.position.z),
          d = new CANNON.Quaternion(r.quaternion.x, r.quaternion.y, r.quaternion.z, r.quaternion.w);
        i.push({ shapeGeometry: c, shapePosition: u, shapeQuaternion: d });
        let l = null;
        a === "cylinder"
          ? ((l = new CylinderGeometry(1, 1, 1, 8, 1)), l.rotateX(Math.PI * 0.5))
          : a === "box"
            ? (l = new BoxGeometry(1, 1, 1))
            : a === "sphere" && (l = new SphereGeometry(1, 8, 8));
        const h = new Mesh(l, this.models.materials[e.mass === 0 ? "static" : "dynamic"]);
        (h.position.copy(r.position),
          h.scale.copy(r.scale),
          h.quaternion.copy(r.quaternion),
          t.model.meshes.push(h));
      }
    }
    for (const s of t.model.meshes)
      ((s.position.x -= t.center.x),
        (s.position.y -= t.center.y),
        (s.position.z -= t.center.z),
        t.model.container.add(s));
    for (const s of i)
      ((s.shapePosition.x -= t.center.x),
        (s.shapePosition.y -= t.center.y),
        (s.shapePosition.z -= t.center.z),
        t.body.addShape(s.shapeGeometry, s.shapePosition, s.shapeQuaternion));
    return (
      (t.body.position.x += t.center.x),
      (t.body.position.y += t.center.y),
      (t.body.position.z += t.center.z),
      (t.origin = {}),
      (t.origin.position = t.body.position.clone()),
      (t.origin.quaternion = t.body.quaternion.clone()),
      (t.origin.sleep = e.sleep),
      this.time.on("tick", () => {
        if (
          (t.model.container.position.set(t.body.position.x, t.body.position.y, t.body.position.z),
          t.model.container.quaternion.set(
            t.body.quaternion.x,
            t.body.quaternion.y,
            t.body.quaternion.z,
            t.body.quaternion.w,
          ),
          this.models.container.visible && e.mass > 0)
        )
          for (const s of t.model.container.children)
            s.material =
              t.body.sleepState === 2
                ? this.models.materials.dynamicSleeping
                : this.models.materials.dynamic;
      }),
      (t.reset = () => {
        (t.body.position.copy(t.origin.position),
          t.body.quaternion.copy(t.origin.quaternion),
          t.origin.sleep && t.body.sleep());
      }),
      t
    );
  }
}
class Zone extends EventEmitter {
  constructor(e) {
    (super(),
      (this.position = e.position),
      (this.halfExtents = e.halfExtents),
      (this.data = e.data),
      (this.isIn = !1),
      (this.mesh = new Mesh(
        new BoxGeometry(e.halfExtents.x * 2, e.halfExtents.y * 2, 3, 1, 1, 1),
        new MeshBasicMaterial({ color: 16711935, wireframe: !0 }),
      )),
      (this.mesh.position.x = e.position.x),
      (this.mesh.position.y = e.position.y),
      (this.mesh.position.z = 1.5));
  }
}
class Zones {
  constructor(e) {
    ((this.time = e.time),
      (this.sizes = e.sizes),
      (this.physics = e.physics),
      (this.debug = e.debug),
      (this.container = new Object3D()),
      (this.container.visible = !1),
      (this.container.matrixAutoUpdate = !1),
      this.debug &&
        ((this.debugFolder = this.debug.addFolder("zones")),
        this.debugFolder.open(),
        this.debugFolder.add(this.container, "visible").name("visible")),
      this.setTester(),
      this.setItems());
  }
  setTester() {
    ((this.tester = {}),
      (this.tester.x = 0),
      (this.tester.y = 0),
      this.time.on("tick", () => {
        ((this.tester.x = this.physics.car.chassis.body.position.x),
          (this.tester.y = this.physics.car.chassis.body.position.y));
      }));
  }
  setItems() {
    ((this.items = []),
      this.time.on("tick", () => {
        for (const e of this.items) {
          const t =
            this.tester.x < e.position.x + e.halfExtents.x &&
            this.tester.x > e.position.x - e.halfExtents.x &&
            this.tester.y < e.position.y + e.halfExtents.y &&
            this.tester.y > e.position.y - e.halfExtents.y;
          (t && !e.isIn ? e.trigger("in", [e.data]) : !t && e.isIn && e.trigger("out", [e.data]),
            (e.isIn = t));
        }
      }));
  }
  add(e) {
    const t = new Zone(e);
    return (this.container.add(t.mesh), this.items.push(t), t);
  }
}
class Objects {
  constructor(e) {
    ((this.time = e.time),
      (this.resources = e.resources),
      (this.materials = e.materials),
      (this.physics = e.physics),
      (this.shadows = e.shadows),
      (this.sounds = e.sounds),
      (this.debug = e.debug),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      (this.items = []),
      (this.floorShadows = []),
      this.setParsers(),
      this.setMerge());
  }
  setParsers() {
    ((this.parsers = {}),
      (this.parsers.items = [
        {
          regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,
          apply: (e, t) => {
            const n = e.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i),
              i = `${n[1].substring(0, 1).toLowerCase()}${n[1].substring(1)}`;
            let s = this.materials.shades.items[i];
            typeof s > "u" && (s = new MeshNormalMaterial());
            const r = t.duplicated ? e.clone() : e;
            if (((r.material = s), r.children.length))
              for (const a of r.children) a instanceof Mesh && (a.material = s);
            return r;
          },
        },
        {
          regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,
          apply: (e, t) => {
            const i = e.name.match(/^pure([a-z]+)_?[0-9]{0,3}?/i)[1].toLowerCase();
            let s = this.materials.pures.items[i];
            typeof s > "u" && (s = new MeshNormalMaterial());
            const r = t.duplicated ? e.clone() : e;
            return ((r.material = s), r);
          },
        },
        {
          regex: /^floor_?[0-9]{0,3}?/i,
          apply: (e, t) => {
            const n = new PlaneGeometry(e.scale.x, e.scale.y, 10, 10),
              i = this.materials.items.floorShadow.clone();
            ((i.uniforms.tShadow.value = t.floorShadowTexture),
              (i.uniforms.uShadowColor.value = new Color(
                this.materials.items.floorShadow.shadowColor,
              )),
              (i.uniforms.uAlpha.value = 0));
            const s = new Mesh(n, i);
            return ((s.matrixAutoUpdate = !1), s.updateMatrix(), this.floorShadows.push(s), s);
          },
        },
      ]),
      (this.parsers.default = {}),
      (this.parsers.default.apply = (e) => {
        const t = e.clone();
        return ((t.material = this.materials.shades.items.white), t);
      }));
  }
  setMerge() {
    ((this.merge = {}),
      (this.merge.items = {}),
      (this.merge.container = new Object3D()),
      (this.merge.container.matrixAutoUpdate = !1),
      this.container.add(this.merge.container),
      (this.merge.add = (e, t) => {
        let n = this.merge.items[e];
        n ||
          ((n = {}),
          (n.geometry = new BufferGeometry()),
          (n.geometriesToMerge = []),
          (n.material = t.material),
          (n.material.side = DoubleSide),
          (n.mesh = new Mesh(n.geometry, n.material)),
          this.merge.container.add(n.mesh),
          (this.merge.items[e] = n));
        const i = t.geometry;
        (t.updateMatrixWorld(), i.applyMatrix(t.matrixWorld), n.geometriesToMerge.push(i));
      }),
      (this.merge.applyMerge = () => {
        for (const e in this.merge.items) {
          const t = this.merge.items[e];
          ((t.geometry = mergeGeometries(t.geometriesToMerge)), (t.mesh.geometry = t.geometry));
        }
      }),
      (this.merge.update = () => {
        for (const e of this.items)
          if (e.shouldMerge) {
            const t = [...e.container.children];
            for (const n of t) {
              const i = n.material.name;
              i !== "" && (this.merge.add(i, n), e.container.remove(n));
            }
            e.shouldMerge = !1;
          }
        this.merge.applyMerge();
      }));
  }
  getConvertedMesh(e, t = {}) {
    const n = new Object3D(),
      i = new Vector3(),
      s = [...e];
    for (const r of s)
      if (
        (r.name.match(/^center_?[0-9]{0,3}?/i) && i.set(r.position.x, r.position.y, r.position.z),
        r instanceof Mesh)
      ) {
        let a = this.parsers.items.find((u) => r.name.match(u.regex));
        typeof a > "u" && (a = this.parsers.default);
        const c = a.apply(r, t);
        n.add(c);
      }
    if (i.length() > 0) {
      for (const r of n.children) r.position.sub(i);
      n.position.add(i);
    }
    return (t.mass && t.mass === 0 && ((n.matrixAutoUpdate = !1), n.updateMatrix()), n);
  }
  add(e) {
    const t = {};
    ((t.merged = !1), (t.shouldMerge = e.mass === 0));
    const n = new Vector3();
    e.offset && n.copy(e.offset);
    const i = new Euler();
    e.rotation && i.copy(e.rotation);
    const s = typeof e.sleep > "u" ? !0 : e.sleep;
    if (
      ((t.container = this.getConvertedMesh(e.base.children, e)),
      t.container.position.copy(n),
      t.container.rotation.copy(i),
      this.container.add(t.container),
      e.mass === 0)
    ) {
      ((t.container.matrixAutoUpdate = !1), t.container.updateMatrix());
      for (const r of t.container.children) ((r.matrixAutoUpdate = !1), r.updateMatrix());
    }
    t.collision = this.physics.addObjectFromThree({
      meshes: [...e.collision.children],
      offset: n,
      rotation: i,
      mass: e.mass,
      sleep: s,
    });
    for (const r of t.container.children) r.position.sub(t.collision.center);
    return (
      e.soundName &&
        t.collision.body.addEventListener("collide", (r) => {
          const a = r.contact.getImpactVelocityAlongNormal();
          this.sounds.play(e.soundName, a);
        }),
      e.shadow && this.shadows.add(t.container, e.shadow),
      e.mass > 0 &&
        this.time.on("tick", () => {
          (t.container.position.copy(t.collision.body.position),
            t.container.quaternion.copy(t.collision.body.quaternion));
        }),
      this.items.push(t),
      t
    );
  }
}
class Car {
  constructor(e) {
    ((this.time = e.time),
      (this.resources = e.resources),
      (this.objects = e.objects),
      (this.physics = e.physics),
      (this.shadows = e.shadows),
      (this.materials = e.materials),
      (this.controls = e.controls),
      (this.sounds = e.sounds),
      (this.renderer = e.renderer),
      (this.camera = e.camera),
      (this.debug = e.debug),
      (this.config = e.config),
      (this.container = new Object3D()),
      (this.position = new Vector3()),
      this.debug && (this.debugFolder = this.debug.addFolder("car")),
      this.setModels(),
      this.setMovement(),
      this.setChassis(),
      this.setAntena(),
      this.setBackLights(),
      this.setWheels(),
      this.setTransformControls(),
      this.setShootingBall(),
      this.setKlaxon());
  }
  setModels() {
    ((this.models = {}),
      this.config.cyberTruck
        ? ((this.models.chassis = this.resources.items.carCyberTruckChassis),
          (this.models.antena = this.resources.items.carCyberTruckAntena),
          (this.models.backLightsBrake = this.resources.items.carCyberTruckBackLightsBrake),
          (this.models.backLightsReverse = this.resources.items.carCyberTruckBackLightsReverse),
          (this.models.wheel = this.resources.items.carCyberTruckWheel))
        : ((this.models.chassis = this.resources.items.carDefaultChassis),
          (this.models.antena = this.resources.items.carDefaultAntena),
          (this.models.backLightsBrake = this.resources.items.carDefaultBackLightsBrake),
          (this.models.backLightsReverse = this.resources.items.carDefaultBackLightsReverse),
          (this.models.wheel = this.resources.items.carDefaultWheel)));
  }
  setMovement() {
    ((this.movement = {}),
      (this.movement.speed = new Vector3()),
      (this.movement.localSpeed = new Vector3()),
      (this.movement.acceleration = new Vector3()),
      (this.movement.localAcceleration = new Vector3()),
      (this.movement.lastScreech = 0),
      this.time.on("tick", () => {
        const e = new Vector3();
        (e.copy(this.chassis.object.position).sub(this.chassis.oldPosition),
          e.multiplyScalar((1 / this.time.delta) * 17),
          (this.movement.acceleration = e.clone().sub(this.movement.speed)),
          this.movement.speed.copy(e),
          (this.movement.localSpeed = this.movement.speed
            .clone()
            .applyAxisAngle(new Vector3(0, 0, 1), -this.chassis.object.rotation.z)),
          (this.movement.localAcceleration = this.movement.acceleration
            .clone()
            .applyAxisAngle(new Vector3(0, 0, 1), -this.chassis.object.rotation.z)),
          (this.sounds.engine.speed = this.movement.localSpeed.x),
          (this.sounds.engine.acceleration = this.controls.actions.up
            ? this.controls.actions.boost
              ? 1
              : 0.5
            : 0),
          this.movement.localAcceleration.x > 0.03 &&
            this.time.elapsed - this.movement.lastScreech > 5e3 &&
            ((this.movement.lastScreech = this.time.elapsed), this.sounds.play("screech")));
      }));
  }
  setChassis() {
    ((this.chassis = {}),
      (this.chassis.offset = new Vector3(0, 0, -0.28)),
      (this.chassis.object = this.objects.getConvertedMesh(this.models.chassis.scene.children)),
      this.chassis.object.position.copy(this.physics.car.chassis.body.position),
      (this.chassis.oldPosition = this.chassis.object.position.clone()),
      this.container.add(this.chassis.object),
      this.shadows.add(this.chassis.object, { sizeX: 3, sizeY: 2, offsetZ: 0.2 }),
      this.time.on("tick", () => {
        ((this.chassis.oldPosition = this.chassis.object.position.clone()),
          this.transformControls.enabled ||
            (this.chassis.object.position
              .copy(this.physics.car.chassis.body.position)
              .add(this.chassis.offset),
            this.chassis.object.quaternion.copy(this.physics.car.chassis.body.quaternion)),
          this.position.copy(this.chassis.object.position));
      }));
  }
  setAntena() {
    if (
      ((this.antena = {}),
      (this.antena.speedStrength = 10),
      (this.antena.damping = 0.035),
      (this.antena.pullBackStrength = 0.02),
      (this.antena.object = this.objects.getConvertedMesh(this.models.antena.scene.children)),
      this.chassis.object.add(this.antena.object),
      (this.antena.speed = new Vector2()),
      (this.antena.absolutePosition = new Vector2()),
      (this.antena.localPosition = new Vector2()),
      this.time.on("tick", () => {
        const t = Math.min(Math.max(this.movement.acceleration.x, -1), 1),
          n = Math.min(Math.max(this.movement.acceleration.y, -1), 1);
        ((this.antena.speed.x -= t * this.antena.speedStrength),
          (this.antena.speed.y -= n * this.antena.speedStrength));
        const i = this.antena.absolutePosition.clone(),
          s = i.negate().multiplyScalar(i.length() * this.antena.pullBackStrength);
        (this.antena.speed.add(s),
          (this.antena.speed.x *= 1 - this.antena.damping),
          (this.antena.speed.y *= 1 - this.antena.damping),
          this.antena.absolutePosition.add(this.antena.speed),
          this.antena.localPosition.copy(this.antena.absolutePosition),
          this.antena.localPosition.rotateAround(new Vector2(), -this.chassis.object.rotation.z),
          (this.antena.object.rotation.y = this.antena.localPosition.x * 0.1),
          (this.antena.object.rotation.x = this.antena.localPosition.y * 0.1));
      }),
      this.debug)
    ) {
      const e = this.debugFolder.addFolder("antena");
      (e.open(),
        e.add(this.antena, "speedStrength").step(0.001).min(0).max(50),
        e.add(this.antena, "damping").step(1e-4).min(0).max(0.1),
        e.add(this.antena, "pullBackStrength").step(1e-4).min(0).max(0.1));
    }
  }
  setBackLights() {
    ((this.backLightsBrake = {}),
      (this.backLightsBrake.material = this.materials.pures.items.red.clone()),
      (this.backLightsBrake.material.transparent = !0),
      (this.backLightsBrake.material.opacity = 0.5),
      (this.backLightsBrake.object = this.objects.getConvertedMesh(
        this.models.backLightsBrake.scene.children,
      )));
    for (const e of this.backLightsBrake.object.children)
      e.material = this.backLightsBrake.material;
    (this.chassis.object.add(this.backLightsBrake.object),
      (this.backLightsReverse = {}),
      (this.backLightsReverse.material = this.materials.pures.items.yellow.clone()),
      (this.backLightsReverse.material.transparent = !0),
      (this.backLightsReverse.material.opacity = 0.5),
      (this.backLightsReverse.object = this.objects.getConvertedMesh(
        this.models.backLightsReverse.scene.children,
      )));
    for (const e of this.backLightsReverse.object.children)
      e.material = this.backLightsReverse.material;
    (this.chassis.object.add(this.backLightsReverse.object),
      this.time.on("tick", () => {
        ((this.backLightsBrake.material.opacity = this.physics.controls.actions.brake ? 1 : 0.5),
          (this.backLightsReverse.material.opacity = this.physics.controls.actions.down ? 1 : 0.5));
      }));
  }
  setWheels() {
    ((this.wheels = {}),
      (this.wheels.object = this.objects.getConvertedMesh(this.models.wheel.scene.children)),
      (this.wheels.items = []));
    for (let e = 0; e < 4; e++) {
      const t = this.wheels.object.clone();
      (this.wheels.items.push(t), this.container.add(t));
    }
    this.time.on("tick", () => {
      if (!this.transformControls.enabled)
        for (const e in this.physics.car.wheels.bodies) {
          const t = this.physics.car.wheels.bodies[e],
            n = this.wheels.items[e];
          (n.position.copy(t.position), n.quaternion.copy(t.quaternion));
        }
    });
  }
  setTransformControls() {
    if (
      ((this.transformControls = new TransformControls(
        this.camera.instance,
        this.renderer.domElement,
      )),
      (this.transformControlsHelper = this.transformControls.getHelper()),
      (this.transformControls.size = 0.5),
      this.transformControls.attach(this.chassis.object),
      (this.transformControls.enabled = !1),
      (this.transformControlsHelper.visible = this.transformControls.enabled),
      document.addEventListener("keydown", (e) => {
        this.mode === "transformControls" &&
          (e.key === "r"
            ? this.transformControls.setMode("rotate")
            : e.key === "g" && this.transformControls.setMode("translate"));
      }),
      this.transformControls.addEventListener("dragging-changed", (e) => {
        this.camera.orbitControls.enabled = !e.value;
      }),
      this.container.add(this.transformControlsHelper),
      this.debug)
    ) {
      const e = this.debugFolder.addFolder("controls");
      (e.open(),
        e.add(this.transformControls, "enabled").onChange(() => {
          this.transformControlsHelper.visible = this.transformControls.enabled;
        }));
    }
  }
  setShootingBall() {
    this.config.cyberTruck &&
      window.addEventListener("keydown", (e) => {
        if (e.key === "b") {
          const t = Math.random() * Math.PI * 2,
            n = 10,
            i = this.position.x + Math.cos(t) * n,
            s = this.position.y + Math.sin(t) * n,
            r = 2 + 2 * Math.random(),
            a = this.objects.add({
              base: this.resources.items.bowlingBallBase.scene,
              collision: this.resources.items.bowlingBallCollision.scene,
              offset: new Vector3(i, s, r),
              rotation: new Euler(Math.PI * 0.5, 0, 0),
              duplicated: !0,
              shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.15, alpha: 0.35 },
              mass: 5,
              soundName: "bowlingBall",
              sleep: !1,
            });
          let u = new CANNON.Vec3(this.position.x, this.position.y, this.position.z + 1).vsub(
            a.collision.body.position,
          );
          (u.normalize(),
            (u = u.scale(100)),
            a.collision.body.applyImpulse(u, a.collision.body.position));
        }
      });
  }
  setKlaxon() {
    ((this.klaxon = {}),
      (this.klaxon.lastTime = this.time.elapsed),
      window.addEventListener("keydown", (e) => {
        if (
          (e.code === "KeyH" &&
            (this.time.elapsed - this.klaxon.lastTime > 400 &&
              (this.physics.car.jump(!1, 150), (this.klaxon.lastTime = this.time.elapsed)),
            this.sounds.play(Math.random() < 0.002 ? "carHorn2" : "carHorn1")),
          e.key === "k")
        ) {
          const t = this.position.x + (Math.random() - 0.5) * 3,
            n = this.position.y + (Math.random() - 0.5) * 3,
            i = 6 + 2 * Math.random();
          this.objects.add({
            base: this.resources.items.hornBase.scene,
            collision: this.resources.items.hornCollision.scene,
            offset: new Vector3(t, n, i),
            rotation: new Euler(
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
            ),
            duplicated: !0,
            shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.15, alpha: 0.35 },
            mass: 5,
            soundName: "horn",
            sleep: !1,
          });
        }
      }));
  }
}
class AreaFloorBorderGeometry {
  constructor(e, t, n) {
    ((this.parameters = { width: e, height: t, thickness: n }), (this.type = "AreaFloorGeometry"));
    const i = 8,
      s = new Float32Array(i * 3),
      r = new Uint32Array(i * 6),
      a = e,
      c = t,
      u = a - n,
      d = c - n;
    ((s[0 * 3 + 0] = u * 0.5),
      (s[0 * 3 + 1] = d * 0.5),
      (s[0 * 3 + 2] = 0),
      (s[1 * 3 + 0] = u * 0.5),
      (s[1 * 3 + 1] = -d * 0.5),
      (s[1 * 3 + 2] = 0),
      (s[2 * 3 + 0] = -u * 0.5),
      (s[2 * 3 + 1] = -d * 0.5),
      (s[2 * 3 + 2] = 0),
      (s[3 * 3 + 0] = -u * 0.5),
      (s[3 * 3 + 1] = d * 0.5),
      (s[3 * 3 + 2] = 0),
      (s[4 * 3 + 0] = a * 0.5),
      (s[4 * 3 + 1] = c * 0.5),
      (s[4 * 3 + 2] = 0),
      (s[5 * 3 + 0] = a * 0.5),
      (s[5 * 3 + 1] = -c * 0.5),
      (s[5 * 3 + 2] = 0),
      (s[6 * 3 + 0] = -a * 0.5),
      (s[6 * 3 + 1] = -c * 0.5),
      (s[6 * 3 + 2] = 0),
      (s[7 * 3 + 0] = -a * 0.5),
      (s[7 * 3 + 1] = c * 0.5),
      (s[7 * 3 + 2] = 0),
      (r[0 * 3 + 0] = 4),
      (r[0 * 3 + 1] = 0),
      (r[0 * 3 + 2] = 1),
      (r[1 * 3 + 0] = 1),
      (r[1 * 3 + 1] = 5),
      (r[1 * 3 + 2] = 4),
      (r[2 * 3 + 0] = 5),
      (r[2 * 3 + 1] = 1),
      (r[2 * 3 + 2] = 2),
      (r[3 * 3 + 0] = 2),
      (r[3 * 3 + 1] = 6),
      (r[3 * 3 + 2] = 5),
      (r[4 * 3 + 0] = 6),
      (r[4 * 3 + 1] = 2),
      (r[4 * 3 + 2] = 3),
      (r[5 * 3 + 0] = 3),
      (r[5 * 3 + 1] = 7),
      (r[5 * 3 + 2] = 6),
      (r[6 * 3 + 0] = 7),
      (r[6 * 3 + 1] = 3),
      (r[6 * 3 + 2] = 0),
      (r[7 * 3 + 0] = 0),
      (r[7 * 3 + 1] = 4),
      (r[7 * 3 + 2] = 7));
    const l = new BufferGeometry();
    return (
      l.setIndex(new BufferAttribute(r, 1, !1)),
      l.setAttribute("position", new Float32BufferAttribute(s, 3)),
      l
    );
  }
}
class AreaFenceGeometry {
  constructor(e, t, n) {
    ((this.parameters = { width: e, height: t, depth: n }), (this.type = "AreaFloorGeometry"));
    const i = 8,
      s = new Float32Array(i * 3),
      r = new Uint32Array(i * 2),
      a = new Uint32Array(i * 6);
    ((s[0 * 3 + 0] = e * 0.5),
      (s[0 * 3 + 1] = t * 0.5),
      (s[0 * 3 + 2] = 0),
      (s[1 * 3 + 0] = e * 0.5),
      (s[1 * 3 + 1] = -t * 0.5),
      (s[1 * 3 + 2] = 0),
      (s[2 * 3 + 0] = -e * 0.5),
      (s[2 * 3 + 1] = -t * 0.5),
      (s[2 * 3 + 2] = 0),
      (s[3 * 3 + 0] = -e * 0.5),
      (s[3 * 3 + 1] = t * 0.5),
      (s[3 * 3 + 2] = 0),
      (s[4 * 3 + 0] = e * 0.5),
      (s[4 * 3 + 1] = t * 0.5),
      (s[4 * 3 + 2] = n),
      (s[5 * 3 + 0] = e * 0.5),
      (s[5 * 3 + 1] = -t * 0.5),
      (s[5 * 3 + 2] = n),
      (s[6 * 3 + 0] = -e * 0.5),
      (s[6 * 3 + 1] = -t * 0.5),
      (s[6 * 3 + 2] = n),
      (s[7 * 3 + 0] = -e * 0.5),
      (s[7 * 3 + 1] = t * 0.5),
      (s[7 * 3 + 2] = n),
      (r[0 * 2 + 0] = 0),
      (r[0 * 2 + 1] = 0),
      (r[1 * 2 + 0] = 1 / 3),
      (r[1 * 2 + 1] = 0),
      (r[2 * 2 + 0] = (1 / 3) * 2),
      (r[2 * 2 + 1] = 0),
      (r[3 * 2 + 0] = 1),
      (r[3 * 2 + 1] = 0),
      (r[4 * 2 + 0] = 0),
      (r[4 * 2 + 1] = 1),
      (r[5 * 2 + 0] = 1 / 3),
      (r[5 * 2 + 1] = 1),
      (r[6 * 2 + 0] = (1 / 3) * 2),
      (r[6 * 2 + 1] = 1),
      (r[7 * 2 + 0] = 1),
      (r[7 * 2 + 1] = 1),
      (a[0 * 3 + 0] = 0),
      (a[0 * 3 + 1] = 4),
      (a[0 * 3 + 2] = 1),
      (a[1 * 3 + 0] = 5),
      (a[1 * 3 + 1] = 1),
      (a[1 * 3 + 2] = 4),
      (a[2 * 3 + 0] = 1),
      (a[2 * 3 + 1] = 5),
      (a[2 * 3 + 2] = 2),
      (a[3 * 3 + 0] = 6),
      (a[3 * 3 + 1] = 2),
      (a[3 * 3 + 2] = 5),
      (a[4 * 3 + 0] = 2),
      (a[4 * 3 + 1] = 6),
      (a[4 * 3 + 2] = 3),
      (a[5 * 3 + 0] = 7),
      (a[5 * 3 + 1] = 3),
      (a[5 * 3 + 2] = 6),
      (a[6 * 3 + 0] = 3),
      (a[6 * 3 + 1] = 7),
      (a[6 * 3 + 2] = 0),
      (a[7 * 3 + 0] = 4),
      (a[7 * 3 + 1] = 0),
      (a[7 * 3 + 2] = 7));
    const c = new BufferGeometry();
    return (
      c.setIndex(new BufferAttribute(a, 1, !1)),
      c.setAttribute("position", new Float32BufferAttribute(s, 3)),
      c.setAttribute("uv", new Float32BufferAttribute(r, 2)),
      c
    );
  }
}
var areaFloorFragment = `uniform float uTime;
uniform float uBorderAlpha;
uniform float uStrikeAlpha;

varying vec3 vPosition;
varying vec3 vModelPosition;
varying vec2 vUv;

void main()
{
    float uStrikeWidth = 0.5;

    float uBorderWidth = 0.1;


    if(vModelPosition.z < 0.0)
    {
        discard;
    }

    float strikeStrength = mod((vPosition.x + vPosition.y - uTime * 0.00035 + vPosition.z) / uStrikeWidth * 0.5, 1.0);
    strikeStrength = step(strikeStrength, 0.5) * uStrikeAlpha;

    float borderStrength = max(step(1.0 - vUv.y, uBorderWidth), step(vUv.y, uBorderWidth)) * uBorderAlpha;

    float alpha = max(strikeStrength, borderStrength);

    gl_FragColor = vec4(vec3(1.0), alpha);


}`,
  areaFloorVertex = `varying vec3 vPosition;
varying vec3 vModelPosition;
varying vec2 vUv;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vPosition = position.xyz;
    vModelPosition = modelPosition.xyz;
    vUv = uv;
}`;
function createAreaFloorMaterial() {
  const o = {
    uTime: { value: null },
    uBorderAlpha: { value: null },
    uStrikeAlpha: { value: null },
  };
  return new ShaderMaterial({
    wireframe: !1,
    transparent: !0,
    side: DoubleSide,
    depthTest: !0,
    depthWrite: !1,
    uniforms: o,
    vertexShader: areaFloorVertex,
    fragmentShader: areaFloorFragment,
  });
}
var areaFenceFragment = `#define M_PI 3.1415926535897932384626433832795

uniform vec3 uColor;
uniform float uAlpha;
uniform float uLoadProgress;
uniform float uProgress;

varying vec3 vPosition;

void main()
{
    float angle = atan(vPosition.x, vPosition.y);
    float loadProgress = step(abs(angle / M_PI), uLoadProgress);
    float progress = step(1.0 - abs(angle / M_PI), uProgress);

    float alpha = uAlpha;
    alpha -= uAlpha * 0.5 * (1.0 - loadProgress);
    alpha *= progress;

    gl_FragColor = vec4(uColor, alpha);

}`,
  areaFenceVertex = `varying vec3 vPosition;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    vPosition = position;
}`;
function createAreaFenceMaterial() {
  const o = {
    uColor: { value: null },
    uAlpha: { value: null },
    uLoadProgress: { value: null },
    uProgress: { value: null },
  };
  return new ShaderMaterial({
    wireframe: !1,
    transparent: !0,
    depthTest: !0,
    depthWrite: !1,
    uniforms: o,
    vertexShader: areaFenceVertex,
    fragmentShader: areaFenceFragment,
  });
}
class Area extends EventEmitter {
  constructor(e) {
    (super(),
      (this.config = e.config),
      (this.renderer = e.renderer),
      (this.resources = e.resources),
      (this.car = e.car),
      (this.sounds = e.sounds),
      (this.time = e.time),
      (this.position = e.position),
      (this.halfExtents = e.halfExtents),
      (this.hasKey = e.hasKey),
      (this.testCar = e.testCar),
      (this.active = e.active),
      (this.container = new Object3D()),
      (this.container.position.x = this.position.x),
      (this.container.position.y = this.position.y),
      (this.container.matrixAutoUpdate = !1),
      this.container.updateMatrix(),
      (this.initialTestCar = this.testCar),
      (this.isIn = !1),
      this.setFloorBorder(),
      this.setFence(),
      this.setInteractions(),
      this.hasKey && this.setKey());
  }
  activate() {
    ((this.active = !0), this.isIn && this.in());
  }
  deactivate() {
    ((this.active = !1), this.isIn && this.out());
  }
  setFloorBorder() {
    ((this.floorBorder = {}),
      (this.floorBorder.geometry = new AreaFloorBorderGeometry(
        this.halfExtents.x * 2,
        this.halfExtents.y * 2,
        0.25,
      )),
      (this.floorBorder.material = new createAreaFenceMaterial()),
      (this.floorBorder.material.uniforms.uColor.value = new Color(16777215)),
      (this.floorBorder.material.uniforms.uAlpha.value = 0.5),
      (this.floorBorder.material.uniforms.uLoadProgress.value = 1),
      (this.floorBorder.material.uniforms.uProgress.value = 1),
      (this.floorBorder.mesh = new Mesh(this.floorBorder.geometry, this.floorBorder.material)),
      (this.floorBorder.mesh.matrixAutoUpdate = !1),
      this.container.add(this.floorBorder.mesh));
  }
  setFence() {
    ((this.fence = {}),
      (this.fence.depth = 0.5),
      (this.fence.offset = 0.5),
      (this.fence.geometry = new AreaFenceGeometry(
        this.halfExtents.x * 2,
        this.halfExtents.y * 2,
        this.fence.depth,
      )),
      (this.fence.material = new createAreaFloorMaterial()),
      (this.fence.material.uniforms.uBorderAlpha.value = 0.5),
      (this.fence.material.uniforms.uStrikeAlpha.value = 0.25),
      (this.fence.mesh = new Mesh(this.fence.geometry, this.fence.material)),
      (this.fence.mesh.position.z = -this.fence.depth),
      this.container.add(this.fence.mesh),
      this.time.on("tick", () => {
        this.fence.material.uniforms.uTime.value = this.time.elapsed;
      }));
  }
  setKey() {
    ((this.key = {}),
      (this.key.hiddenZ = 1.5),
      (this.key.shownZ = 2.5),
      (this.key.container = new Object3D()),
      (this.key.container.position.z = this.key.hiddenZ),
      this.container.add(this.key.container),
      (this.key.enter = {}),
      (this.key.enter.size = 1.4),
      (this.key.enter.geometry = new PlaneGeometry(
        this.key.enter.size,
        this.key.enter.size / 4,
        1,
        1,
      )),
      (this.key.enter.texture = this.resources.items.areaEnterTexture),
      (this.key.enter.texture.magFilter = NearestFilter),
      (this.key.enter.texture.minFilter = LinearFilter),
      (this.key.enter.material = new MeshBasicMaterial({
        color: 16777215,
        alphaMap: this.key.enter.texture,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
      })),
      (this.key.enter.mesh = new Mesh(this.key.enter.geometry, this.key.enter.material)),
      (this.key.enter.mesh.rotation.x = Math.PI * 0.5),
      (this.key.enter.mesh.position.x = this.key.enter.size * 0.75),
      (this.key.enter.mesh.matrixAutoUpdate = !1),
      this.key.enter.mesh.updateMatrix(),
      this.key.container.add(this.key.enter.mesh),
      (this.key.icon = {}),
      (this.key.icon.size = 0.75),
      (this.key.icon.geometry = new PlaneGeometry(this.key.icon.size, this.key.icon.size, 1, 1)),
      (this.key.icon.texture = this.resources.items.areaKeyEnterTexture),
      (this.key.icon.texture.magFilter = NearestFilter),
      (this.key.icon.texture.minFilter = LinearFilter),
      (this.key.icon.material = new MeshBasicMaterial({
        color: 16777215,
        alphaMap: this.key.icon.texture,
        transparent: !0,
        opacity: 0,
        depthWrite: !1,
      })),
      (this.key.icon.mesh = new Mesh(this.key.icon.geometry, this.key.icon.material)),
      (this.key.icon.mesh.rotation.x = Math.PI * 0.5),
      (this.key.icon.mesh.position.x = -this.key.enter.size * 0.15),
      (this.key.icon.mesh.matrixAutoUpdate = !1),
      this.key.icon.mesh.updateMatrix(),
      this.key.container.add(this.key.icon.mesh));
  }
  interact(e = !0) {
    this.active &&
      (gsap.killTweensOf(this.fence.mesh.position),
      gsap.killTweensOf(this.floorBorder.material.uniforms.uAlpha),
      gsap.killTweensOf(this.fence.material.uniforms.uBorderAlpha),
      this.hasKey &&
        (gsap.killTweensOf(this.key.container.position),
        gsap.killTweensOf(this.key.icon.material),
        gsap.killTweensOf(this.key.enter.material)),
      gsap.to(this.fence.mesh.position, {
        z: 0,
        duration: 0.05,
        onComplete: () => {
          (gsap.to(this.fence.mesh.position, { z: 0.5, duration: 0.25, ease: "back.out(2)" }),
            gsap.fromTo(
              this.floorBorder.material.uniforms.uAlpha,
              { value: 1 },
              { value: 0.5, duration: 1.5 },
            ),
            gsap.fromTo(
              this.fence.material.uniforms.uBorderAlpha,
              { value: 1 },
              { value: 0.5, duration: 1.5 },
            ));
        },
      }),
      this.hasKey &&
        e &&
        ((this.key.container.position.z = this.key.shownZ),
        gsap.fromTo(this.key.icon.material, { opacity: 1 }, { opacity: 0.5, duration: 1.5 }),
        gsap.fromTo(this.key.enter.material, { opacity: 1 }, { opacity: 0.5, duration: 1.5 })),
      this.sounds.play("uiArea"),
      this.trigger("interact"));
  }
  in(e = !0) {
    ((this.isIn = !0),
      this.active &&
        (gsap.killTweensOf(this.fence.mesh.position),
        gsap.to(this.fence.mesh.position, {
          z: this.fence.offset,
          duration: 0.35,
          ease: "back.out(3)",
        }),
        this.hasKey &&
          (gsap.killTweensOf(this.key.container.position),
          gsap.killTweensOf(this.key.icon.material),
          gsap.killTweensOf(this.key.enter.material),
          e &&
            (gsap.to(this.key.container.position, {
              z: this.key.shownZ,
              duration: 0.35,
              ease: "back.out(3)",
              delay: 0.1,
            }),
            gsap.to(this.key.icon.material, {
              opacity: 0.5,
              duration: 0.35,
              ease: "back.out(3)",
              delay: 0.1,
            }),
            gsap.to(this.key.enter.material, {
              opacity: 0.5,
              duration: 0.35,
              ease: "back.out(3)",
              delay: 0.1,
            }))),
        this.config.touch || this.renderer.domElement.classList.add("has-cursor-pointer"),
        this.trigger("in")));
  }
  out() {
    ((this.isIn = !1),
      gsap.killTweensOf(this.fence.mesh.position),
      gsap.to(this.fence.mesh.position, {
        z: -this.fence.depth,
        duration: 0.35,
        ease: "back.in(4)",
      }),
      this.hasKey &&
        (gsap.killTweensOf(this.key.container.position),
        gsap.killTweensOf(this.key.icon.material),
        gsap.killTweensOf(this.key.enter.material),
        gsap.to(this.key.container.position, {
          z: this.key.hiddenZ,
          duration: 0.35,
          ease: "back.in(4)",
          delay: 0.1,
        }),
        gsap.to(this.key.icon.material, {
          opacity: 0,
          duration: 0.35,
          ease: "back.in(4)",
          delay: 0.1,
        }),
        gsap.to(this.key.enter.material, {
          opacity: 0,
          duration: 0.35,
          ease: "back.in(4)",
          delay: 0.1,
        })),
      this.config.touch || this.renderer.domElement.classList.remove("has-cursor-pointer"),
      this.trigger("out"));
  }
  setInteractions() {
    ((this.mouseMesh = new Mesh(
      new PlaneGeometry(this.halfExtents.x * 2, this.halfExtents.y * 2, 1, 1),
      new MeshBasicMaterial({ transparent: !0, opacity: 0 }),
    )),
      (this.mouseMesh.position.z = -0.01),
      (this.mouseMesh.matrixAutoUpdate = !1),
      this.mouseMesh.updateMatrix(),
      this.container.add(this.mouseMesh),
      this.time.on("tick", () => {
        if (this.testCar) {
          const e =
            Math.abs(this.car.position.x - this.position.x) < Math.abs(this.halfExtents.x) &&
            Math.abs(this.car.position.y - this.position.y) < Math.abs(this.halfExtents.y);
          e !== this.isIn && (e ? this.in(!this.config.touch) : this.out());
        }
      }),
      window.addEventListener("keydown", (e) => {
        (e.key === "f" || e.key === "e" || e.key === "Enter") && this.isIn && this.interact();
      }));
  }
}
class Areas {
  constructor(e) {
    ((this.config = e.config),
      (this.resources = e.resources),
      (this.car = e.car),
      (this.sounds = e.sounds),
      (this.renderer = e.renderer),
      (this.camera = e.camera),
      (this.time = e.time),
      (this.debug = e.debug),
      (this.items = []),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.setMouse());
  }
  setMouse() {
    ((this.mouse = {}),
      (this.mouse.raycaster = new Raycaster()),
      (this.mouse.coordinates = new Vector2()),
      (this.mouse.currentArea = null),
      (this.mouse.needsUpdate = !1),
      window.addEventListener("mousemove", (e) => {
        ((this.mouse.coordinates.x = (e.clientX / window.innerWidth) * 2 - 1),
          (this.mouse.coordinates.y = -(e.clientY / window.innerHeight) * 2 + 1),
          (this.mouse.needsUpdate = !0));
      }),
      window.addEventListener("mousedown", () => {
        this.mouse.currentArea && this.mouse.currentArea.interact(!1);
      }),
      this.renderer.domElement.addEventListener("touchstart", (e) => {
        this.mouse.touchStart =
          e.touches.length === 1
            ? {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY,
                time: performance.now(),
              }
            : null;
        ((this.mouse.coordinates.x = (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1),
          (this.mouse.coordinates.y = -(e.changedTouches[0].clientY / window.innerHeight) * 2 + 1),
          (this.mouse.needsUpdate = !0));
      }),
      // Resolve a tap synchronously: synthetic mouse events can precede the next
      // animation tick, otherwise the first mobile tap only establishes hover.
      this.renderer.domElement.addEventListener(
        "touchend",
        (event) => {
          const start = this.mouse.touchStart,
            touch = event.changedTouches[0];
          this.mouse.touchStart = null;
          if (
            !start ||
            !touch ||
            event.touches.length ||
            performance.now() - start.time > 500 ||
            Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 10
          )
            return;
          this.mouse.coordinates.set(
            (touch.clientX / window.innerWidth) * 2 - 1,
            -(touch.clientY / window.innerHeight) * 2 + 1,
          );
          this.mouse.raycaster.setFromCamera(this.mouse.coordinates, this.camera.instance);
          const hit = this.mouse.raycaster.intersectObjects(
            this.items.map((area) => area.mouseMesh),
          )[0];
          const area = hit && this.items.find((item) => item.mouseMesh === hit.object);
          if (area?.active) {
            event.preventDefault(); // Avoid a second interaction from a synthesized mousedown.
            area.interact(false);
          }
        },
        { passive: false },
      ),
      this.time.on("tick", () => {
        if (this.mouse.needsUpdate) {
          ((this.mouse.needsUpdate = !1),
            this.mouse.raycaster.setFromCamera(this.mouse.coordinates, this.camera.instance));
          const e = this.items.map((n) => n.mouseMesh),
            t = this.mouse.raycaster.intersectObjects(e);
          if (t.length) {
            const n = this.items.find((i) => i.mouseMesh === t[0].object);
            n !== this.mouse.currentArea &&
              (this.mouse.currentArea !== null &&
                (this.mouse.currentArea.out(),
                (this.mouse.currentArea.testCar = this.mouse.currentArea.initialTestCar)),
              (this.mouse.currentArea = n),
              this.mouse.currentArea.in(!1),
              (this.mouse.currentArea.testCar = !1));
          } else
            this.mouse.currentArea !== null &&
              (this.mouse.currentArea.out(),
              (this.mouse.currentArea.testCar = this.mouse.currentArea.initialTestCar),
              (this.mouse.currentArea = null));
        }
      }));
  }
  add(e) {
    const t = new Area({
      config: this.config,
      renderer: this.renderer,
      resources: this.resources,
      car: this.car,
      sounds: this.sounds,
      time: this.time,
      hasKey: !0,
      testCar: !0,
      active: !0,
      ...e,
    });
    return (this.container.add(t.container), this.items.push(t), t);
  }
}
class Tiles {
  constructor(e) {
    ((this.resources = e.resources),
      (this.objects = e.objects),
      (this.debug = e.debug),
      (this.items = []),
      (this.interDistance = 1.5),
      (this.tangentDistance = 0.3),
      (this.positionRandomess = 0.3),
      (this.rotationRandomess = 0.1),
      this.setModels());
  }
  setModels() {
    ((this.models = {}),
      (this.models.items = [
        {
          base: this.resources.items.tilesABase.scene,
          collision: this.resources.items.tilesACollision.scene,
          chances: 8,
        },
        {
          base: this.resources.items.tilesBBase.scene,
          collision: this.resources.items.tilesBCollision.scene,
          chances: 1,
        },
        {
          base: this.resources.items.tilesCBase.scene,
          collision: this.resources.items.tilesCCollision.scene,
          chances: 2,
        },
        {
          base: this.resources.items.tilesDBase.scene,
          collision: this.resources.items.tilesDCollision.scene,
          chances: 4,
        },
        {
          base: this.resources.items.tilesEBase.scene,
          collision: this.resources.items.tilesECollision.scene,
          chances: 2,
        },
      ]));
    const e = this.models.items.reduce((n, i) => n + i.chances, 0);
    let t = 0;
    ((this.models.items = this.models.items.map(
      (n) => (
        (n.minChances = t),
        (t += n.chances / e),
        (n.maxChances = t),
        (n.rotationIndex = 0),
        n
      ),
    )),
      (this.models.pick = () => {
        const n = Math.random(),
          i = this.models.items.find((s) => n >= s.minChances && n <= s.maxChances);
        return (i.rotationIndex++, i.rotationIndex > 3 && (i.rotationIndex = 0), i);
      }));
  }
  add(e) {
    const t = {};
    ((t.start = e.start),
      (t.delta = e.delta),
      (t.distance = t.delta.length()),
      (t.count = Math.floor(t.distance / this.interDistance)),
      (t.directionVector = t.delta.clone().normalize()),
      (t.interVector = t.directionVector.clone().multiplyScalar(this.interDistance)),
      (t.centeringVector = t.delta.clone().sub(t.interVector.clone().multiplyScalar(t.count))),
      (t.tangentVector = t.directionVector
        .clone()
        .rotateAround(new Vector2(0, 0), Math.PI * 0.5)
        .multiplyScalar(this.tangentDistance)),
      (t.angle = t.directionVector.angle()));
    for (let n = 0; n < t.count; n++) {
      const i = this.models.pick(),
        s = t.start.clone().add(t.interVector.clone().multiplyScalar(n)).add(t.centeringVector);
      ((s.x += (Math.random() - 0.5) * this.positionRandomess),
        (s.y += (Math.random() - 0.5) * this.positionRandomess));
      const r = t.tangentVector;
      (n % 1 === 0 && r.negate(), s.add(r));
      let a = t.angle;
      ((a += (Math.random() - 0.5) * this.rotationRandomess),
        (a += (i.rotationIndex / 4) * Math.PI * 2),
        this.objects.add({
          base: i.base,
          collision: i.collision,
          offset: new Vector3(s.x, s.y, 0),
          rotation: new Euler(0, 0, a),
          duplicated: !0,
          mass: 0,
        }));
    }
  }
}
class Walls {
  constructor(e) {
    ((this.resources = e.resources), (this.objects = e.objects));
  }
  add(e) {
    const t = {};
    ((t.coordinates = []), (t.items = []));
    const n = e.shape;
    let i = n.widthCount,
      s = n.heightCount;
    switch (e.shape.type) {
      case "rectangle":
      case "brick":
        for (let r = 0; r < s; r++) {
          const a = r === s - 1;
          let c = 0,
            u = i;
          for (
            e.shape.type === "brick" &&
            a &&
            e.shape.equilibrateLastLine &&
            (r % 2 === 0 ? u-- : c++);
            c < u;
            c++
          ) {
            const d = new Vector3();
            (d.add(n.offsetWidth.clone().multiplyScalar(c - (n.widthCount - 1) * 0.5)),
              d.add(n.offsetHeight.clone().multiplyScalar(r)),
              (d.x += (Math.random() - 0.5) * n.randomOffset.x),
              (d.y += (Math.random() - 0.5) * n.randomOffset.y),
              (d.z += (Math.random() - 0.5) * n.randomOffset.z),
              e.shape.type === "brick" &&
                r % 2 === 0 &&
                d.add(n.offsetWidth.clone().multiplyScalar(0.5)));
            const l = new Euler();
            ((l.x += (Math.random() - 0.5) * n.randomRotation.x),
              (l.y += (Math.random() - 0.5) * n.randomRotation.y),
              (l.z += (Math.random() - 0.5) * n.randomRotation.z),
              t.coordinates.push({ offset: d, rotation: l }));
          }
        }
        break;
      case "triangle":
        s = n.widthCount;
        for (let r = 0; r < s; r++) {
          for (let a = 0; a < i; a++) {
            const c = new Vector3();
            (c.add(n.offsetWidth.clone().multiplyScalar(a - (n.widthCount - 1) * 0.5)),
              c.add(n.offsetWidth.clone().multiplyScalar(r * 0.5)),
              c.add(n.offsetHeight.clone().multiplyScalar(r)),
              (c.x += (Math.random() - 0.5) * n.randomOffset.x),
              (c.y += (Math.random() - 0.5) * n.randomOffset.y),
              (c.z += (Math.random() - 0.5) * n.randomOffset.z),
              e.shape.type === "brick" &&
                r % 2 === 0 &&
                c.add(n.offsetWidth.clone().multiplyScalar(0.5)));
            const u = new Euler();
            ((u.x += (Math.random() - 0.5) * n.randomRotation.x),
              (u.y += (Math.random() - 0.5) * n.randomRotation.y),
              (u.z += (Math.random() - 0.5) * n.randomRotation.z),
              t.coordinates.push({ offset: c, rotation: u }));
          }
          i--;
        }
        break;
    }
    for (const r of t.coordinates) {
      const a = { ...e.object };
      ((a.offset = e.object.offset.clone().add(r.offset).add(n.position)),
        (a.rotation = e.object.rotation.clone()),
        (a.rotation.x += r.rotation.x),
        (a.rotation.y += r.rotation.y),
        (a.rotation.z += r.rotation.z),
        t.items.push(this.objects.add(a)));
    }
    return t;
  }
}
class IntroSection {
  constructor(e) {
    ((this.config = e.config),
      (this.time = e.time),
      (this.resources = e.resources),
      (this.objects = e.objects),
      (this.areas = e.areas),
      (this.walls = e.walls),
      (this.tiles = e.tiles),
      (this.debug = e.debug),
      (this.x = e.x),
      (this.y = e.y),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.container.updateMatrix(),
      this.setStatic(),
      this.setInstructions(),
      this.setOtherInstructions(),
      this.setTitles(),
      this.setTiles(),
      this.setDikes());
  }
  setStatic() {
    this.objects.add({
      base: this.resources.items.introStaticBase.scene,
      collision: this.resources.items.introStaticCollision.scene,
      floorShadowTexture: this.resources.items.introStaticFloorShadowTexture,
      offset: new Vector3(0, 0, 0),
      mass: 0,
    });
  }
  setInstructions() {
    ((this.instructions = {}),
      (this.instructions.arrows = {}),
      (this.instructions.arrows.label = {}),
      (this.instructions.arrows.label.texture = this.config.touch
        ? this.resources.items.introInstructionsControlsTexture
        : this.resources.items.introInstructionsArrowsTexture),
      (this.instructions.arrows.label.texture.magFilter = NearestFilter),
      (this.instructions.arrows.label.texture.minFilter = LinearFilter),
      (this.instructions.arrows.label.material = new MeshBasicMaterial({
        transparent: !0,
        alphaMap: this.instructions.arrows.label.texture,
        color: 16777215,
        depthWrite: !1,
        opacity: 0,
      })),
      (this.instructions.arrows.label.geometry =
        this.resources.items.introInstructionsLabels.scene.children.find(
          (e) => e.name === "arrows",
        ).geometry),
      (this.instructions.arrows.label.mesh = new Mesh(
        this.instructions.arrows.label.geometry,
        this.instructions.arrows.label.material,
      )),
      this.container.add(this.instructions.arrows.label.mesh),
      this.config.touch ||
        ((this.instructions.arrows.up = this.objects.add({
          base: this.resources.items.introArrowKeyBase.scene,
          collision: this.resources.items.introArrowKeyCollision.scene,
          offset: new Vector3(0, 0, 0),
          rotation: new Euler(0, 0, 0),
          duplicated: !0,
          shadow: { sizeX: 1, sizeY: 1, offsetZ: -0.2, alpha: 0.5 },
          mass: 1.5,
          soundName: "brick",
        })),
        (this.instructions.arrows.down = this.objects.add({
          base: this.resources.items.introArrowKeyBase.scene,
          collision: this.resources.items.introArrowKeyCollision.scene,
          offset: new Vector3(0, -0.8, 0),
          rotation: new Euler(0, 0, Math.PI),
          duplicated: !0,
          shadow: { sizeX: 1, sizeY: 1, offsetZ: -0.2, alpha: 0.5 },
          mass: 1.5,
          soundName: "brick",
        })),
        (this.instructions.arrows.left = this.objects.add({
          base: this.resources.items.introArrowKeyBase.scene,
          collision: this.resources.items.introArrowKeyCollision.scene,
          offset: new Vector3(-0.8, -0.8, 0),
          rotation: new Euler(0, 0, Math.PI * 0.5),
          duplicated: !0,
          shadow: { sizeX: 1, sizeY: 1, offsetZ: -0.2, alpha: 0.5 },
          mass: 1.5,
          soundName: "brick",
        })),
        (this.instructions.arrows.right = this.objects.add({
          base: this.resources.items.introArrowKeyBase.scene,
          collision: this.resources.items.introArrowKeyCollision.scene,
          offset: new Vector3(0.8, -0.8, 0),
          rotation: new Euler(0, 0, -Math.PI * 0.5),
          duplicated: !0,
          shadow: { sizeX: 1, sizeY: 1, offsetZ: -0.2, alpha: 0.5 },
          mass: 1.5,
          soundName: "brick",
        }))));
  }
  setOtherInstructions() {
    this.config.touch ||
      ((this.otherInstructions = {}),
      (this.otherInstructions.x = 16),
      (this.otherInstructions.y = -2),
      (this.otherInstructions.container = new Object3D()),
      (this.otherInstructions.container.position.x = this.otherInstructions.x),
      (this.otherInstructions.container.position.y = this.otherInstructions.y),
      (this.otherInstructions.container.matrixAutoUpdate = !1),
      this.otherInstructions.container.updateMatrix(),
      this.container.add(this.otherInstructions.container),
      (this.otherInstructions.label = {}),
      (this.otherInstructions.label.geometry = new PlaneGeometry(6, 6, 1, 1)),
      (this.otherInstructions.label.texture = this.resources.items.introInstructionsOtherTexture),
      (this.otherInstructions.label.texture.magFilter = NearestFilter),
      (this.otherInstructions.label.texture.minFilter = LinearFilter),
      (this.otherInstructions.label.material = new MeshBasicMaterial({
        transparent: !0,
        alphaMap: this.otherInstructions.label.texture,
        color: 16777215,
        depthWrite: !1,
        opacity: 0,
      })),
      (this.otherInstructions.label.mesh = new Mesh(
        this.otherInstructions.label.geometry,
        this.otherInstructions.label.material,
      )),
      (this.otherInstructions.label.mesh.matrixAutoUpdate = !1),
      this.otherInstructions.container.add(this.otherInstructions.label.mesh),
      (this.otherInstructions.horn = this.objects.add({
        base: this.resources.items.hornBase.scene,
        collision: this.resources.items.hornCollision.scene,
        offset: new Vector3(this.otherInstructions.x + 1.25, this.otherInstructions.y - 2.75, 0.2),
        rotation: new Euler(0, 0, 0.5),
        duplicated: !0,
        shadow: { sizeX: 1.65, sizeY: 0.75, offsetZ: -0.1, alpha: 0.4 },
        mass: 1.5,
        soundName: "horn",
        sleep: !1,
      })));
  }
  setTitles() {
    (globalThis.gitskinsFolioData && globalThis.gitskinsFolioData.username) ||
      (this.objects.add({
        base: this.resources.items.introBBase.scene,
        collision: this.resources.items.introBCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introRBase.scene,
        collision: this.resources.items.introRCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introUBase.scene,
        collision: this.resources.items.introUCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introNBase.scene,
        collision: this.resources.items.introNCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        duplicated: !0,
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introOBase.scene,
        collision: this.resources.items.introOCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        duplicated: !0,
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introSBase.scene,
        collision: this.resources.items.introSCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introIBase.scene,
        collision: this.resources.items.introICollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introMBase.scene,
        collision: this.resources.items.introMCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introOBase.scene,
        collision: this.resources.items.introOCollision.scene,
        offset: new Vector3(3.95, 0, 0),
        rotation: new Euler(0, 0, 0),
        duplicated: !0,
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introNBase.scene,
        collision: this.resources.items.introNCollision.scene,
        offset: new Vector3(5.85, 0, 0),
        rotation: new Euler(0, 0, 0),
        duplicated: !0,
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.4 },
        mass: 1.5,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introCreativeBase.scene,
        collision: this.resources.items.introCreativeCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0.25),
        shadow: { sizeX: 5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.3 },
        mass: 1.5,
        sleep: !1,
        soundName: "brick",
      }),
      this.objects.add({
        base: this.resources.items.introDevBase.scene,
        collision: this.resources.items.introDevCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(0, 0, 0),
        shadow: { sizeX: 2.5, sizeY: 1.5, offsetZ: -0.6, alpha: 0.3 },
        mass: 1.5,
        soundName: "brick",
      }));
  }
  setTiles() {
    this.tiles.add({ start: new Vector2(0, -4.5), delta: new Vector2(0, -4.5) });
  }
  setDikes() {
    ((this.dikes = {}),
      (this.dikes.brickOptions = {
        base: this.resources.items.brickBase.scene,
        collision: this.resources.items.brickCollision.scene,
        offset: new Vector3(0, 0, 0.1),
        rotation: new Euler(0, 0, 0),
        duplicated: !0,
        shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: -0.15, alpha: 0.35 },
        mass: 0.5,
        soundName: "brick",
      }),
      this.walls.add({
        object: this.dikes.brickOptions,
        shape: {
          type: "brick",
          equilibrateLastLine: !0,
          widthCount: 5,
          heightCount: 2,
          position: new Vector3(this.x - 12, this.y - 13, 0),
          offsetWidth: new Vector3(0, 1.05, 0),
          offsetHeight: new Vector3(0, 0, 0.45),
          randomOffset: new Vector3(0, 0, 0),
          randomRotation: new Vector3(0, 0, 0.2),
        },
      }),
      this.walls.add({
        object: { ...this.dikes.brickOptions, rotation: new Euler(0, 0, Math.PI * 0.5) },
        shape: {
          type: "brick",
          equilibrateLastLine: !0,
          widthCount: 3,
          heightCount: 2,
          position: new Vector3(this.x + 8, this.y + 6, 0),
          offsetWidth: new Vector3(1.05, 0, 0),
          offsetHeight: new Vector3(0, 0, 0.45),
          randomOffset: new Vector3(0, 0, 0),
          randomRotation: new Vector3(0, 0, 0.2),
        },
      }),
      this.walls.add({
        object: this.dikes.brickOptions,
        shape: {
          type: "brick",
          equilibrateLastLine: !1,
          widthCount: 3,
          heightCount: 2,
          position: new Vector3(this.x + 9.9, this.y + 4.7, 0),
          offsetWidth: new Vector3(0, -1.05, 0),
          offsetHeight: new Vector3(0, 0, 0.45),
          randomOffset: new Vector3(0, 0, 0),
          randomRotation: new Vector3(0, 0, 0.2),
        },
      }),
      this.walls.add({
        object: { ...this.dikes.brickOptions, rotation: new Euler(0, 0, Math.PI * 0.5) },
        shape: {
          type: "brick",
          equilibrateLastLine: !0,
          widthCount: 3,
          heightCount: 2,
          position: new Vector3(this.x - 14, this.y + 2, 0),
          offsetWidth: new Vector3(1.05, 0, 0),
          offsetHeight: new Vector3(0, 0, 0.45),
          randomOffset: new Vector3(0, 0, 0),
          randomRotation: new Vector3(0, 0, 0.2),
        },
      }),
      this.walls.add({
        object: this.dikes.brickOptions,
        shape: {
          type: "brick",
          equilibrateLastLine: !1,
          widthCount: 3,
          heightCount: 2,
          position: new Vector3(this.x - 14.8, this.y + 0.7, 0),
          offsetWidth: new Vector3(0, -1.05, 0),
          offsetHeight: new Vector3(0, 0, 0.45),
          randomOffset: new Vector3(0, 0, 0),
          randomRotation: new Vector3(0, 0, 0.2),
        },
      }),
      this.walls.add({
        object: this.dikes.brickOptions,
        shape: {
          type: "brick",
          equilibrateLastLine: !0,
          widthCount: 3,
          heightCount: 2,
          position: new Vector3(this.x - 14.8, this.y - 3.5, 0),
          offsetWidth: new Vector3(0, -1.05, 0),
          offsetHeight: new Vector3(0, 0, 0.45),
          randomOffset: new Vector3(0, 0, 0),
          randomRotation: new Vector3(0, 0, 0.2),
        },
      }),
      this.config.touch ||
        (this.walls.add({
          object: { ...this.dikes.brickOptions, rotation: new Euler(0, 0, Math.PI * 0.5) },
          shape: {
            type: "brick",
            equilibrateLastLine: !0,
            widthCount: 2,
            heightCount: 2,
            position: new Vector3(this.x + 18.5, this.y + 3, 0),
            offsetWidth: new Vector3(1.05, 0, 0),
            offsetHeight: new Vector3(0, 0, 0.45),
            randomOffset: new Vector3(0, 0, 0),
            randomRotation: new Vector3(0, 0, 0.2),
          },
        }),
        this.walls.add({
          object: this.dikes.brickOptions,
          shape: {
            type: "brick",
            equilibrateLastLine: !1,
            widthCount: 2,
            heightCount: 2,
            position: new Vector3(this.x + 19.9, this.y + 2.2, 0),
            offsetWidth: new Vector3(0, -1.05, 0),
            offsetHeight: new Vector3(0, 0, 0.45),
            randomOffset: new Vector3(0, 0, 0),
            randomRotation: new Vector3(0, 0, 0.2),
          },
        })));
  }
}
var projectBoardFragment = `uniform sampler2D uTexture;
uniform vec3 uColor;
uniform float uTextureAlpha;

varying vec2 vUv;

void main()
{
    vec4 textureColor = texture2D(uTexture, vUv);

    gl_FragColor = mix(vec4(uColor, 1.0), textureColor, uTextureAlpha);
	#include <colorspace_fragment>
}`,
  projectBoardVertex = `varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
function createProjectBoardMaterial() {
  const o = { uTexture: { value: null }, uTextureAlpha: { value: null }, uColor: { value: null } };
  return new ShaderMaterial({
    wireframe: !1,
    transparent: !1,
    uniforms: o,
    vertexShader: projectBoardVertex,
    fragmentShader: projectBoardFragment,
  });
}
class Project {
  constructor(e) {
    ((this.time = e.time),
      (this.resources = e.resources),
      (this.objects = e.objects),
      (this.areas = e.areas),
      (this.name = e.name),
      (this.geometries = e.geometries),
      (this.meshes = e.meshes),
      (this.debug = e.debug),
      (this.name = e.name),
      (this.x = e.x),
      (this.y = e.y),
      (this.imageSources = e.imageSources),
      (this.floorTexture = e.floorTexture),
      (this.link = e.link),
      (this.distinctions = e.distinctions),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.setBoards(),
      this.setFloor());
  }
  setBoards() {
    ((this.boards = {}),
      (this.boards.items = []),
      (this.boards.xStart = -5),
      (this.boards.xInter = 5),
      (this.boards.y = 5),
      (this.boards.color = "#8e7161"),
      (this.boards.threeColor = new Color(this.boards.color)),
      this.debug &&
        this.debug
          .addColor(this.boards, "color")
          .name("boardColor")
          .onChange(() => {
            this.boards.threeColor.set(this.boards.color);
          }));
    let e = 0;
    for (const t of this.imageSources) {
      const n = {};
      ((n.x = this.x + this.boards.xStart + e * this.boards.xInter),
        (n.y = this.y + this.boards.y),
        this.objects.add({
          base: this.resources.items.projectsBoardStructure.scene,
          collision: this.resources.items.projectsBoardCollision.scene,
          floorShadowTexture: this.resources.items.projectsBoardStructureFloorShadowTexture,
          offset: new Vector3(n.x, n.y, 0),
          rotation: new Euler(0, 0, 0),
          duplicated: !0,
          mass: 0,
        }));
      const i = new Image();
      ((i.crossOrigin = "anonymous"),
        i.addEventListener("load", () => {
          ((n.texture = new Texture(i)),
            (n.texture.anisotropy = 4),
            (n.texture.needsUpdate = !0),
            (n.planeMesh.material.uniforms.uTexture.value = n.texture),
            gsap.to(n.planeMesh.material.uniforms.uTextureAlpha, {
              value: 1,
              duration: 1,
              ease: "power4.inOut",
            }));
        }),
        (i.src = t),
        (n.planeMesh = this.meshes.boardPlane.clone()),
        (n.planeMesh.position.x = n.x),
        (n.planeMesh.position.y = n.y),
        (n.planeMesh.matrixAutoUpdate = !1),
        n.planeMesh.updateMatrix(),
        (n.planeMesh.material = new createProjectBoardMaterial()),
        (n.planeMesh.material.uniforms.uColor.value = this.boards.threeColor),
        (n.planeMesh.material.uniforms.uTextureAlpha.value = 0),
        this.container.add(n.planeMesh),
        this.boards.items.push(n),
        e++);
    }
  }
  setFloor() {
    if (
      ((this.floor = {}),
      (this.floor.x = 0),
      (this.floor.y = -2),
      (this.floor.container = new Object3D()),
      (this.floor.container.position.x = this.x + this.floor.x),
      (this.floor.container.position.y = this.y + this.floor.y),
      (this.floor.container.matrixAutoUpdate = !1),
      this.floor.container.updateMatrix(),
      this.container.add(this.floor.container),
      (this.floor.texture = this.floorTexture),
      (this.floor.texture.magFilter = NearestFilter),
      (this.floor.texture.minFilter = LinearFilter),
      (this.floor.geometry = this.geometries.floor),
      (this.floor.material = new MeshBasicMaterial({
        transparent: !0,
        depthWrite: !1,
        alphaMap: this.floor.texture,
      })),
      (this.floor.mesh = new Mesh(this.floor.geometry, this.floor.material)),
      (this.floor.mesh.matrixAutoUpdate = !1),
      this.floor.container.add(this.floor.mesh),
      this.distinctions)
    )
      for (const e of this.distinctions) {
        let t = null,
          n = null,
          i = null,
          s = null;
        switch (e.type) {
          case "awwwards":
            ((t = this.resources.items.projectsDistinctionsAwwwardsBase.scene),
              (n = this.resources.items.projectsDistinctionsAwwwardsCollision.scene),
              (i = 1.5),
              (s = 1.5));
            break;
          case "fwa":
            ((t = this.resources.items.projectsDistinctionsFWABase.scene),
              (n = this.resources.items.projectsDistinctionsFWACollision.scene),
              (i = 2),
              (s = 1));
            break;
          case "cssda":
            ((t = this.resources.items.projectsDistinctionsCSSDABase.scene),
              (n = this.resources.items.projectsDistinctionsCSSDACollision.scene),
              (i = 1.2),
              (s = 1.2));
            break;
        }
        this.objects.add({
          base: t,
          collision: n,
          offset: new Vector3(this.x + this.floor.x + e.x, this.y + this.floor.y + e.y, 0),
          rotation: new Euler(0, 0, 0),
          duplicated: !0,
          shadow: { sizeX: i, sizeY: s, offsetZ: -0.1, alpha: 0.5 },
          mass: 1.5,
          soundName: "woodHit",
        });
      }
    ((this.floor.area = this.areas.add({
      position: new Vector2(this.x + this.link.x, this.y + this.floor.y + this.link.y),
      halfExtents: new Vector2(this.link.halfExtents.x, this.link.halfExtents.y),
    })),
      this.floor.area.on("interact", () => {
        window.open(this.link.href, "_blank");
      }),
      (this.floor.areaLabel = this.meshes.areaLabel.clone()),
      (this.floor.areaLabel.position.x = this.link.x),
      (this.floor.areaLabel.position.y = this.link.y),
      (this.floor.areaLabel.position.z = 0.001),
      (this.floor.areaLabel.matrixAutoUpdate = !1),
      this.floor.areaLabel.updateMatrix(),
      this.floor.container.add(this.floor.areaLabel));
  }
}
function escapeSvg(o) {
  return String(o || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
function createProjectSlide(o, e) {
  const t = [
      ["#101820", "#ff8908", "#f7f2e9"],
      ["#11151d", "#8bd3dd", "#f8fbff"],
      ["#17121b", "#d6a4ff", "#fff7fd"],
    ],
    [n, i, s] = t[e % t.length],
    r = escapeSvg(o.name || "GitHub project").slice(0, 28),
    a = escapeSvg(o.description || "A project built in public.").slice(0, 54),
    c = escapeSvg(o.language || "Open source").slice(0, 20),
    u = Number(o.stars || 0).toLocaleString(),
    d = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
        <rect width="1200" height="675" fill="${n}"/>
        <circle cx="970" cy="100" r="250" fill="${i}" opacity=".1"/>
        <path d="M80 560H1120" stroke="${i}" stroke-width="4" opacity=".7"/>
        <path d="M80 585H720" stroke="${s}" stroke-width="2" opacity=".18"/>
        <text x="80" y="110" fill="${i}" font-family="monospace" font-size="24" letter-spacing="6">GITHUB PROJECT / 0${e + 1}</text>
        <text x="80" y="300" fill="${s}" font-family="Arial,sans-serif" font-size="74" font-weight="700">${r}</text>
        <text x="84" y="360" fill="${s}" opacity=".7" font-family="Arial,sans-serif" font-size="28">${a}</text>
        <text x="84" y="490" fill="${i}" font-family="monospace" font-size="24">${c}  ·  ${u} stars</text>
        <text x="1120" y="620" fill="${s}" opacity=".4" text-anchor="end" font-family="monospace" font-size="18">GITSKINS / FOLIO</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(d)}`;
}
function createProjectFloorTexture(o, e, t) {
  const n = document.createElement("canvas");
  ((n.width = 1200), (n.height = 600));
  const i = n.getContext("2d");
  if (!i) return new Texture();
  const s = String(o.name || "GitHub project")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase(),
    r = String(o.description || "A project built in public.")
      .replace(/\s+/g, " ")
      .trim(),
    a = String(o.language || "Open source")
      .replace(/\s+/g, " ")
      .trim(),
    c = String(e.username || "octocat")
      .replace(/^@/, "")
      .toUpperCase(),
    u = Number(o.stars || 0).toLocaleString(),
    d = `GITHUB PROJECT / ${String(t + 1).padStart(2, "0")}`;
  (i.clearRect(0, 0, n.width, n.height),
    (i.fillStyle = "rgba(255, 255, 255, 0.96)"),
    (i.textAlign = "left"),
    (i.textBaseline = "top"),
    (i.font = "700 26px Arial, sans-serif"),
    i.fillText(d, 72, 58),
    (i.font = "700 62px Arial, sans-serif"),
    i.fillText(s.slice(0, 26), 72, 132),
    (i.font = "italic 28px Arial, sans-serif"));
  const l = r.split(" ");
  let h = "",
    f = 240;
  for (const g of l) {
    const m = h ? `${h} ${g}` : g;
    if (i.measureText(m).width > 760 && h) {
      if ((i.fillText(h, 72, f), (h = g), (f += 38), f > 320)) break;
    } else h = m;
  }
  (h && f <= 320 && i.fillText(h, 72, f),
    (i.font = "700 26px Arial, sans-serif"),
    i.fillText(`${a.toUpperCase()}  /  ${u} STARS`, 72, 410),
    (i.font = "700 22px Arial, sans-serif"),
    i.fillText(`OPEN ${s.slice(0, 18)}`, 72, 486),
    (i.textAlign = "right"),
    (i.font = "700 20px monospace"),
    i.fillText(`${c} / GITSKINS`, 1128, 540));
  const p = new CanvasTexture(n);
  return ((p.magFilter = NearestFilter), (p.minFilter = LinearFilter), (p.needsUpdate = !0), p);
}
class ProjectsSection {
  constructor(e) {
    ((this.time = e.time),
      (this.resources = e.resources),
      (this.camera = e.camera),
      (this.passes = e.passes),
      (this.objects = e.objects),
      (this.areas = e.areas),
      (this.zones = e.zones),
      (this.tiles = e.tiles),
      (this.debug = e.debug),
      (this.x = e.x),
      (this.y = e.y),
      this.debug &&
        ((this.debugFolder = this.debug.addFolder("projects")), this.debugFolder.open()),
      (this.items = []),
      (this.interDistance = 24),
      (this.positionRandomess = 5),
      (this.projectHalfWidth = 9),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.container.updateMatrix(),
      this.setGeometries(),
      this.setMeshes(),
      this.setList(),
      this.setZone());
    for (const t of this.list) this.add(t);
  }
  setGeometries() {
    ((this.geometries = {}), (this.geometries.floor = new PlaneGeometry(16, 8)));
  }
  setMeshes() {
    ((this.meshes = {}),
      (this.resources.items.areaOpenTexture.magFilter = NearestFilter),
      (this.resources.items.areaOpenTexture.minFilter = LinearFilter),
      (this.meshes.boardPlane = this.resources.items.projectsBoardPlane.scene.children[0]),
      (this.meshes.areaLabel = new Mesh(
        new PlaneGeometry(2, 0.5),
        new MeshBasicMaterial({
          transparent: !0,
          depthWrite: !1,
          color: 16777215,
          alphaMap: this.resources.items.areaOpenTexture,
        }),
      )),
      (this.meshes.areaLabel.matrixAutoUpdate = !1));
  }
  setList() {
    var s, r;
    const e = globalThis.gitskinsFolioData || {},
      t = Array.isArray(e.pinnedRepos) ? e.pinnedRepos : [];
    if (t.length > 0) {
      this.list = t.slice(0, 6).map((a, c) => ({
        name: a.name,
        imageSources: [0, 1, 2].map((u) => createProjectSlide(a, u)),
        floorTexture: createProjectFloorTexture(a, e, c),
        link: { href: a.url, x: -4.8, y: -3, halfExtents: { x: 3.2, y: 1.5 } },
        distinctions: [],
      }));
      return;
    }
    const n = e.username || "octocat",
      i = {
        name: `${n} / GitHub profile`,
        description: "Public GitHub activity and projects.",
        language:
          ((r = (s = e.languages) == null ? void 0 : s[0]) == null ? void 0 : r.name) ||
          "Open source",
        stars: e.totalStars || 0,
        url: `https://github.com/${encodeURIComponent(n)}`,
      };
    this.list = [
      {
        name: i.name,
        imageSources: [0, 1, 2].map((a) => createProjectSlide(i, a)),
        floorTexture: createProjectFloorTexture(i, e, 0),
        link: { href: i.url, x: -4.8, y: -3, halfExtents: { x: 3.2, y: 1.5 } },
        distinctions: [],
      },
    ];
  }
  setZone() {
    const e = this.list.length * (this.interDistance / 2),
      t = this.zones.add({
        position: { x: this.x + e - this.projectHalfWidth - 6, y: this.y },
        halfExtents: { x: e, y: 12 },
        data: { cameraAngle: "projects" },
      });
    (t.on("in", (n) => {
      (this.camera.angle.set(n.cameraAngle),
        gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, {
          x: 0,
          duration: 2,
        }),
        gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, {
          y: 0,
          duration: 2,
        }));
    }),
      t.on("out", () => {
        (this.camera.angle.set("default"),
          gsap.to(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, {
            x: this.passes.horizontalBlurPass.strength,
            duration: 2,
          }),
          gsap.to(this.passes.verticalBlurPass.material.uniforms.uStrength.value, {
            y: this.passes.verticalBlurPass.strength,
            duration: 2,
          }));
      }));
  }
  add(e) {
    const t = this.x + this.items.length * this.interDistance;
    let n = this.y;
    this.items.length > 0 && (n += (Math.random() - 0.5) * this.positionRandomess);
    const i = new Project({
      time: this.time,
      resources: this.resources,
      objects: this.objects,
      areas: this.areas,
      geometries: this.geometries,
      meshes: this.meshes,
      debug: this.debugFolder,
      x: t,
      y: n,
      ...e,
    });
    if ((this.container.add(i.container), this.items.length >= 1)) {
      const s = this.items[this.items.length - 1],
        r = new Vector2(s.x + this.projectHalfWidth, s.y),
        c = new Vector2(i.x - this.projectHalfWidth, i.y).clone().sub(r);
      this.tiles.add({ start: r, delta: c });
    }
    this.items.push(i);
  }
}
class CrossroadsSection {
  constructor(e) {
    ((this.time = e.time),
      (this.resources = e.resources),
      (this.objects = e.objects),
      (this.areas = e.areas),
      (this.tiles = e.tiles),
      (this.debug = e.debug),
      (this.x = e.x),
      (this.y = e.y),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.setStatic(),
      this.setTiles());
  }
  setStatic() {
    this.objects.add({
      base: this.resources.items.crossroadsStaticBase.scene,
      collision: this.resources.items.crossroadsStaticCollision.scene,
      floorShadowTexture: this.resources.items.crossroadsStaticFloorShadowTexture,
      offset: new Vector3(this.x, this.y, 0),
      mass: 0,
    });
  }
  setTiles() {
    (this.tiles.add({ start: new Vector2(this.x, -10), delta: new Vector2(0, this.y + 14) }),
      this.tiles.add({ start: new Vector2(this.x + 12.5, this.y), delta: new Vector2(7.5, 0) }),
      this.tiles.add({ start: new Vector2(this.x - 13, this.y), delta: new Vector2(-6, 0) }));
  }
}
function createLinkTexture(o) {
  const e = document.createElement("canvas");
  ((e.width = 512), (e.height = 128));
  const t = e.getContext("2d");
  if (!t) return new Texture();
  (t.clearRect(0, 0, e.width, e.height),
    (t.fillStyle = "#ffffff"),
    (t.font = "700 46px Arial, sans-serif"),
    (t.textAlign = "center"),
    (t.textBaseline = "middle"),
    t.fillText(o, e.width / 2, e.height / 2));
  const n = new CanvasTexture(e);
  return ((n.needsUpdate = !0), n);
}
function createActivityTexture(o) {
  const e = document.createElement("canvas");
  ((e.width = 1200), (e.height = 600));
  const t = e.getContext("2d");
  if (!t) return new Texture();
  const i = ((o.contributionCalendar && o.contributionCalendar.weeks) || [])
      .flatMap((p) => p.contributionDays || [])
      .slice(-364),
    s = Math.max(...i.map((p) => p.contributionCount || 0), 1),
    r = o.name || o.username || "GitHub profile";
  ((t.fillStyle = "#101820"),
    t.fillRect(0, 0, e.width, e.height),
    (t.fillStyle = "#ffb06b"),
    (t.font = "700 34px Arial, sans-serif"),
    t.fillText(`${r}'s GitHub signal`, 52, 76),
    (t.fillStyle = "rgba(255,255,255,.62)"),
    (t.font = "22px Arial, sans-serif"),
    t.fillText(`${o.totalContributions || 0} contributions in the last year`, 52, 112));
  const a = 52,
    c = 7,
    u = 16,
    d = 5,
    l = 52,
    h = 170;
  for (let p = 0; p < a * c; p++) {
    const m = ((i[p] || { contributionCount: 0 }).contributionCount || 0) / s,
      v =
        m >= 0.75
          ? "#ffb06b"
          : m >= 0.5
            ? "#d47a39"
            : m >= 0.25
              ? "#824b2e"
              : m > 0
                ? "#4c3528"
                : "#1b2930",
      _ = Math.floor(p / c),
      y = p % c;
    ((t.fillStyle = v), t.fillRect(l + _ * (u + d), h + y * (u + d), u, u));
  }
  ((t.fillStyle = "rgba(255,255,255,.48)"),
    (t.font = "18px monospace"),
    t.fillText("LESS", l, 490),
    t.fillText("MORE", l + 900, 490));
  const f = new CanvasTexture(e);
  return ((f.needsUpdate = !0), f);
}
class InformationSection {
  constructor(e) {
    ((this.time = e.time),
      (this.resources = e.resources),
      (this.objects = e.objects),
      (this.areas = e.areas),
      (this.tiles = e.tiles),
      (this.debug = e.debug),
      (this.x = e.x),
      (this.y = e.y),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.setStatic(),
      this.setBaguettes(),
      this.setLinks(),
      this.setActivities(),
      this.setTiles());
  }
  setStatic() {
    this.objects.add({
      base: this.resources.items.informationStaticBase.scene,
      collision: this.resources.items.informationStaticCollision.scene,
      floorShadowTexture: this.resources.items.informationStaticFloorShadowTexture,
      offset: new Vector3(this.x, this.y, 0),
      mass: 0,
    });
  }
  setBaguettes() {
    ((this.baguettes = {}),
      (this.baguettes.x = -4),
      (this.baguettes.y = 6),
      (this.baguettes.a = this.objects.add({
        base: this.resources.items.informationBaguetteBase.scene,
        collision: this.resources.items.informationBaguetteCollision.scene,
        offset: new Vector3(
          this.x + this.baguettes.x - 0.56,
          this.y + this.baguettes.y - 0.666,
          0.2,
        ),
        rotation: new Euler(0, 0, (-Math.PI * 37) / 180),
        duplicated: !0,
        shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: -0.15, alpha: 0.35 },
        mass: 1.5,
      })),
      (this.baguettes.b = this.objects.add({
        base: this.resources.items.informationBaguetteBase.scene,
        collision: this.resources.items.informationBaguetteCollision.scene,
        offset: new Vector3(this.x + this.baguettes.x - 0.8, this.y + this.baguettes.y - 2, 0.5),
        rotation: new Euler(0, -0.5, (Math.PI * 60) / 180),
        duplicated: !0,
        shadow: { sizeX: 0.6, sizeY: 3.5, offsetZ: -0.15, alpha: 0.35 },
        mass: 1.5,
        sleep: !1,
      })));
  }
  setLinks() {
    ((this.links = {}),
      (this.links.x = 1.95),
      (this.links.y = -1.5),
      (this.links.halfExtents = {}),
      (this.links.halfExtents.x = 1),
      (this.links.halfExtents.y = 1),
      (this.links.distanceBetween = 2.4),
      (this.links.labelWidth = this.links.halfExtents.x * 2 + 1),
      (this.links.labelGeometry = new PlaneGeometry(
        this.links.labelWidth,
        this.links.labelWidth * 0.25,
        1,
        1,
      )),
      (this.links.labelOffset = -1.6),
      (this.links.items = []),
      (this.links.container = new Object3D()),
      (this.links.container.matrixAutoUpdate = !1),
      this.container.add(this.links.container));
    const e = globalThis.gitskinsFolioData || {},
      t = e.username || "octocat";
    this.links.options = [
      {
        href: `https://github.com/${encodeURIComponent(t)}`,
        labelTexture: createLinkTexture("GITHUB"),
      },
      e.websiteUrl ? { href: e.websiteUrl, labelTexture: createLinkTexture("WEBSITE") } : null,
      e.twitterUsername
        ? {
            href: `https://twitter.com/${encodeURIComponent(e.twitterUsername)}`,
            labelTexture: createLinkTexture("SOCIAL"),
          }
        : null,
    ].filter(Boolean);
    let n = 0;
    for (const i of this.links.options) {
      const s = {};
      ((s.x = this.x + this.links.x + this.links.distanceBetween * n),
        (s.y = this.y + this.links.y),
        (s.href = i.href),
        (s.area = this.areas.add({
          position: new Vector2(s.x, s.y),
          halfExtents: new Vector2(this.links.halfExtents.x, this.links.halfExtents.y),
        })),
        s.area.on("interact", () => {
          window.open(i.href, "_blank");
        }),
        (s.texture = i.labelTexture),
        (s.texture.magFilter = NearestFilter),
        (s.texture.minFilter = LinearFilter),
        (s.labelMesh = new Mesh(
          this.links.labelGeometry,
          new MeshBasicMaterial({
            wireframe: !1,
            color: 16777215,
            alphaMap: i.labelTexture,
            depthTest: !0,
            depthWrite: !1,
            transparent: !0,
          }),
        )),
        (s.labelMesh.position.x = s.x + this.links.labelWidth * 0.5 - this.links.halfExtents.x),
        (s.labelMesh.position.y = s.y + this.links.labelOffset),
        (s.labelMesh.matrixAutoUpdate = !1),
        s.labelMesh.updateMatrix(),
        this.links.container.add(s.labelMesh),
        this.links.items.push(s),
        n++);
    }
  }
  setActivities() {
    ((this.activities = {}),
      (this.activities.x = this.x + 0),
      (this.activities.y = this.y - 10),
      (this.activities.multiplier = 5.5),
      (this.activities.geometry = new PlaneGeometry(
        2 * this.activities.multiplier,
        1 * this.activities.multiplier,
        1,
        1,
      )),
      (this.activities.texture = createActivityTexture(globalThis.gitskinsFolioData || {})),
      (this.activities.texture.magFilter = NearestFilter),
      (this.activities.texture.minFilter = LinearFilter),
      (this.activities.material = new MeshBasicMaterial({
        wireframe: !1,
        color: 16777215,
        alphaMap: this.activities.texture,
        transparent: !0,
      })),
      (this.activities.mesh = new Mesh(this.activities.geometry, this.activities.material)),
      (this.activities.mesh.position.x = this.activities.x),
      (this.activities.mesh.position.y = this.activities.y),
      (this.activities.mesh.matrixAutoUpdate = !1),
      this.activities.mesh.updateMatrix(),
      this.container.add(this.activities.mesh));
  }
  setTiles() {
    this.tiles.add({ start: new Vector2(this.x - 1.2, this.y + 13), delta: new Vector2(0, -20) });
  }
}
class PlaygroundSection {
  constructor(e) {
    ((this.time = e.time),
      (this.resources = e.resources),
      (this.objects = e.objects),
      (this.areas = e.areas),
      (this.walls = e.walls),
      (this.tiles = e.tiles),
      (this.debug = e.debug),
      (this.x = e.x),
      (this.y = e.y),
      this.debug && (this.debugFolder = this.debug.addFolder("playgroundSection")),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      (this.resources.items.areaResetTexture.magFilter = NearestFilter),
      (this.resources.items.areaResetTexture.minFilter = LinearFilter),
      this.setStatic(),
      this.setBricksWalls(),
      this.setBowling());
  }
  setStatic() {
    this.objects.add({
      base: this.resources.items.playgroundStaticBase.scene,
      collision: this.resources.items.playgroundStaticCollision.scene,
      floorShadowTexture: this.resources.items.playgroundStaticFloorShadowTexture,
      offset: new Vector3(this.x, this.y, 0),
      mass: 0,
    });
  }
  setBricksWalls() {
    ((this.brickWalls = {}),
      (this.brickWalls.x = this.x + 15),
      (this.brickWalls.y = this.y + 14),
      (this.brickWalls.items = []),
      (this.brickWalls.brickOptions = {
        base: this.resources.items.brickBase.scene,
        collision: this.resources.items.brickCollision.scene,
        offset: new Vector3(0, 0, 0.1),
        rotation: new Euler(0, 0, 0),
        duplicated: !0,
        shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: -0.15, alpha: 0.35 },
        mass: 0.5,
        soundName: "brick",
      }),
      this.brickWalls.items.push(
        this.walls.add({
          object: this.brickWalls.brickOptions,
          shape: {
            type: "rectangle",
            widthCount: 5,
            heightCount: 6,
            position: new Vector3(this.brickWalls.x - 6, this.brickWalls.y, 0),
            offsetWidth: new Vector3(0, 1.05, 0),
            offsetHeight: new Vector3(0, 0, 0.45),
            randomOffset: new Vector3(0, 0, 0),
            randomRotation: new Vector3(0, 0, 0.4),
          },
        }),
        this.walls.add({
          object: this.brickWalls.brickOptions,
          shape: {
            type: "brick",
            widthCount: 5,
            heightCount: 6,
            position: new Vector3(this.brickWalls.x - 12, this.brickWalls.y, 0),
            offsetWidth: new Vector3(0, 1.05, 0),
            offsetHeight: new Vector3(0, 0, 0.45),
            randomOffset: new Vector3(0, 0, 0),
            randomRotation: new Vector3(0, 0, 0.4),
          },
        }),
        this.walls.add({
          object: this.brickWalls.brickOptions,
          shape: {
            type: "triangle",
            widthCount: 6,
            position: new Vector3(this.brickWalls.x - 18, this.brickWalls.y, 0),
            offsetWidth: new Vector3(0, 1.05, 0),
            offsetHeight: new Vector3(0, 0, 0.45),
            randomOffset: new Vector3(0, 0, 0),
            randomRotation: new Vector3(0, 0, 0.4),
          },
        }),
      ),
      (this.brickWalls.reset = () => {
        for (const e of this.brickWalls.items) for (const t of e.items) t.collision.reset();
      }),
      (this.brickWalls.resetArea = this.areas.add({
        position: new Vector2(this.brickWalls.x, this.brickWalls.y),
        halfExtents: new Vector2(2, 2),
      })),
      this.brickWalls.resetArea.on("interact", () => {
        this.brickWalls.reset();
      }),
      (this.brickWalls.areaLabelMesh = new Mesh(
        new PlaneGeometry(2, 0.5),
        new MeshBasicMaterial({
          transparent: !0,
          depthWrite: !1,
          color: 16777215,
          alphaMap: this.resources.items.areaResetTexture,
        }),
      )),
      (this.brickWalls.areaLabelMesh.position.x = this.brickWalls.x),
      (this.brickWalls.areaLabelMesh.position.y = this.brickWalls.y),
      (this.brickWalls.areaLabelMesh.matrixAutoUpdate = !1),
      this.brickWalls.areaLabelMesh.updateMatrix(),
      this.container.add(this.brickWalls.areaLabelMesh),
      this.debugFolder && this.debugFolder.add(this.brickWalls, "reset").name("brickWalls reset"));
  }
  setBowling() {
    ((this.bowling = {}),
      (this.bowling.x = this.x + 15),
      (this.bowling.y = this.y + 4),
      (this.bowling.pins = this.walls.add({
        object: {
          base: this.resources.items.bowlingPinBase.scene,
          collision: this.resources.items.bowlingPinCollision.scene,
          offset: new Vector3(0, 0, 0.1),
          rotation: new Euler(0, 0, 0),
          duplicated: !0,
          shadow: { sizeX: 1.4, sizeY: 1.4, offsetZ: -0.15, alpha: 0.35 },
          mass: 0.1,
          soundName: "bowlingPin",
        },
        shape: {
          type: "triangle",
          widthCount: 4,
          position: new Vector3(this.bowling.x - 25, this.bowling.y, 0),
          offsetWidth: new Vector3(0, 1, 0),
          offsetHeight: new Vector3(0.65, 0, 0),
          randomOffset: new Vector3(0, 0, 0),
          randomRotation: new Vector3(0, 0, 0),
        },
      })),
      (this.bowling.ball = this.objects.add({
        base: this.resources.items.bowlingBallBase.scene,
        collision: this.resources.items.bowlingBallCollision.scene,
        offset: new Vector3(this.bowling.x - 5, this.bowling.y, 0),
        rotation: new Euler(Math.PI * 0.5, 0, 0),
        duplicated: !0,
        shadow: { sizeX: 1.5, sizeY: 1.5, offsetZ: -0.15, alpha: 0.35 },
        mass: 1,
        soundName: "bowlingBall",
      })),
      (this.bowling.reset = () => {
        for (const e of this.bowling.pins.items) e.collision.reset();
        this.bowling.ball.collision.reset();
      }),
      (this.bowling.resetArea = this.areas.add({
        position: new Vector2(this.bowling.x, this.bowling.y),
        halfExtents: new Vector2(2, 2),
      })),
      this.bowling.resetArea.on("interact", () => {
        this.bowling.reset();
      }),
      (this.bowling.areaLabelMesh = new Mesh(
        new PlaneGeometry(2, 0.5),
        new MeshBasicMaterial({
          transparent: !0,
          depthWrite: !1,
          color: 16777215,
          alphaMap: this.resources.items.areaResetTexture,
        }),
      )),
      (this.bowling.areaLabelMesh.position.x = this.bowling.x),
      (this.bowling.areaLabelMesh.position.y = this.bowling.y),
      (this.bowling.areaLabelMesh.matrixAutoUpdate = !1),
      this.bowling.areaLabelMesh.updateMatrix(),
      this.container.add(this.bowling.areaLabelMesh),
      this.debugFolder && this.debugFolder.add(this.bowling, "reset").name("bowling reset"));
  }
}
const touchCrossImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAA0CAMAAADG3yrFAAAAYFBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////98JRy6AAAAH3RSTlMAu0T56AQTUMyoLX97pM+vn1QwlCsOzoh2cGtFQDnR6vXj9wAAANpJREFUSMft08sOgjAQheERKJRrEQQVL33/t7S3tAk1OU1cmfAvJrPo4ltM6UtsE2JjlNTCpYovlFIvTT0lVElXRbCyUO/egxpFmYTIpyl3EIxoiVoLwYiBETEHwQi9NRaCEToHwQgTWy0EIzykxggECQgf4wYCEBEEIgIEIADEIhq9AUhARHUWEiNWg8CQ2iMAJEbEkPMOwQ0CQwICQRyi0xuA7BAAAhCmi4cEBIYsAYEhd4+AkBuNaooMJox6lsnN9JLJPfVvSOxKqmw8JTQ+6G87TvQ40Z/7AKq5RWVOmj58AAAAAElFTkSuQmCC",
  touchTriangleImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAkCAMAAADFCSheAAAAXVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////9RKvvlAAAAHnRSTlMARLvoBBP4UC3MqKR9z3lTMK+A+p8OlGvRuohwRTwkmquJAAAAxUlEQVQ4y5XOtxLCQBRDURnWORsH4v7/Z/Jmx2MVwGi5hSoVB19y2zhuDlEtpbfKBTHVPlQjotzv5ZClZ/tdW5tzGoW4DENGiEBMQLNDJKJ1gCNEIGAVhAgEQIhCWIRoxAGpNEJBiDhyJSGMiCwgNCQgGjBCBEJAAqIAGCERCEL6nwgNqYiQECI+6wghogwIDSFCQ4jQECKgIURoSO+tDpaGLERoyIMIBekw246JbAzq1Ue34hV/ToAp9nuHlcy3k25+4r/eTIAs8/NO/cUAAAAASUVORK5CYII=",
  touchDoubleTriangleImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAANlBMVEUAAAD////////////////////////////////////////////////////////////////////xY8b8AAAAEXRSTlMA/OdVKViVlFDu3nHpGAi2RvH48bcAAACESURBVCjPdc8xFoMwEANR4YVkbQPJ3v+y8CjUSKj9jQaYvwm72Hsgq+rrdFuqOmbRRWvH0eiiSwIrXTQAulVxUbqquir9IypOtU71XlTvVPX+sCqL+N/ru8fzudOdBvutst/pBtCtWqeqq9JV1ZNqfVDV82aq+gT+rSVgfNQ48L5zPXEBEccPFOsAa88AAAAASUVORK5CYII=";
class Controls extends EventEmitter {
  constructor(e) {
    (super(),
      (this.config = e.config),
      (this.sizes = e.sizes),
      (this.time = e.time),
      (this.camera = e.camera),
      (this.sounds = e.sounds),
      this.setActions(),
      this.setKeyboard());
  }
  setActions() {
    ((this.actions = {}),
      (this.actions.up = !1),
      (this.actions.right = !1),
      (this.actions.down = !1),
      (this.actions.left = !1),
      (this.actions.brake = !1),
      (this.actions.boost = !1),
      document.addEventListener("visibilitychange", () => {
        document.hidden ||
          ((this.actions.up = !1),
          (this.actions.right = !1),
          (this.actions.down = !1),
          (this.actions.left = !1),
          (this.actions.brake = !1),
          (this.actions.boost = !1));
      }));
  }
  setKeyboard() {
    ((this.keyboard = {}),
      (this.keyboard.events = {}),
      (this.keyboard.events.keyDown = (e) => {
        switch (e.code) {
          case "ArrowUp":
          case "KeyW":
            (this.camera.pan.reset(), (this.actions.up = !0));
            break;
          case "ArrowRight":
          case "KeyD":
            this.actions.right = !0;
            break;
          case "ArrowDown":
          case "KeyS":
            (this.camera.pan.reset(), (this.actions.down = !0));
            break;
          case "ArrowLeft":
          case "KeyA":
            this.actions.left = !0;
            break;
          case "ControlLeft":
          case "ControlRight":
          case "Space":
            this.actions.brake = !0;
            break;
          case "ShiftLeft":
          case "ShiftRight":
            this.actions.boost = !0;
            break;
        }
      }),
      (this.keyboard.events.keyUp = (e) => {
        switch (e.code) {
          case "ArrowUp":
          case "KeyW":
            this.actions.up = !1;
            break;
          case "ArrowRight":
          case "KeyD":
            this.actions.right = !1;
            break;
          case "ArrowDown":
          case "KeyS":
            this.actions.down = !1;
            break;
          case "ArrowLeft":
          case "KeyA":
            this.actions.left = !1;
            break;
          case "ControlLeft":
          case "ControlRight":
          case "Space":
            this.actions.brake = !1;
            break;
          case "ShiftLeft":
          case "ShiftRight":
            this.actions.boost = !1;
            break;
          case "KeyR":
            this.trigger("action", ["reset"]);
            break;
        }
      }),
      document.addEventListener("keydown", this.keyboard.events.keyDown),
      document.addEventListener("keyup", this.keyboard.events.keyUp));
  }
  setTouch() {
    ((this.touch = {}),
      (this.touch.joystick = {}),
      (this.touch.joystick.active = !1),
      (this.touch.joystick.$element = document.createElement("div")),
      (this.touch.joystick.$element.style.userSelect = "none"),
      (this.touch.joystick.$element.style.position = "fixed"),
      (this.touch.joystick.$element.style.bottom = "10px"),
      (this.touch.joystick.$element.style.left = "10px"),
      (this.touch.joystick.$element.style.width = "170px"),
      (this.touch.joystick.$element.style.height = "170px"),
      (this.touch.joystick.$element.style.borderRadius = "50%"),
      (this.touch.joystick.$element.style.transition = "opacity 0.3s 0.0s"),
      (this.touch.joystick.$element.style.willChange = "opacity"),
      (this.touch.joystick.$element.style.opacity = "0"),
      document.body.appendChild(this.touch.joystick.$element),
      (this.touch.joystick.$cursor = document.createElement("div")),
      (this.touch.joystick.$cursor.style.position = "absolute"),
      (this.touch.joystick.$cursor.style.top = "calc(50% - 30px)"),
      (this.touch.joystick.$cursor.style.left = "calc(50% - 30px)"),
      (this.touch.joystick.$cursor.style.width = "60px"),
      (this.touch.joystick.$cursor.style.height = "60px"),
      (this.touch.joystick.$cursor.style.border = "2px solid #ffffff"),
      (this.touch.joystick.$cursor.style.borderRadius = "50%"),
      (this.touch.joystick.$cursor.style.boxSizing = "border-box"),
      (this.touch.joystick.$cursor.style.pointerEvents = "none"),
      (this.touch.joystick.$cursor.style.willChange = "transform"),
      this.touch.joystick.$element.appendChild(this.touch.joystick.$cursor),
      (this.touch.joystick.$limit = document.createElement("div")),
      (this.touch.joystick.$limit.style.position = "absolute"),
      (this.touch.joystick.$limit.style.top = "calc(50% - 75px)"),
      (this.touch.joystick.$limit.style.left = "calc(50% - 75px)"),
      (this.touch.joystick.$limit.style.width = "150px"),
      (this.touch.joystick.$limit.style.height = "150px"),
      (this.touch.joystick.$limit.style.border = "2px solid #ffffff"),
      (this.touch.joystick.$limit.style.borderRadius = "50%"),
      (this.touch.joystick.$limit.style.opacity = "0.25"),
      (this.touch.joystick.$limit.style.pointerEvents = "none"),
      (this.touch.joystick.$limit.style.boxSizing = "border-box"),
      this.touch.joystick.$element.appendChild(this.touch.joystick.$limit),
      (this.touch.joystick.angle = {}),
      (this.touch.joystick.angle.offset = Math.PI * 0.18),
      (this.touch.joystick.angle.center = {}),
      (this.touch.joystick.angle.center.x = 0),
      (this.touch.joystick.angle.center.y = 0),
      (this.touch.joystick.angle.current = {}),
      (this.touch.joystick.angle.current.x = 0),
      (this.touch.joystick.angle.current.y = 0),
      (this.touch.joystick.angle.originalValue = 0),
      (this.touch.joystick.angle.value = -Math.PI * 0.5),
      (this.touch.joystick.resize = () => {
        const e = this.touch.joystick.$element.getBoundingClientRect();
        ((this.touch.joystick.angle.center.x = e.left + e.width * 0.5),
          (this.touch.joystick.angle.center.y = e.top + e.height * 0.5));
      }),
      this.sizes.on("resize", this.touch.joystick.resize),
      this.touch.joystick.resize(),
      this.time.on("tick", () => {
        if (this.touch.joystick.active) {
          ((this.touch.joystick.angle.originalValue = -Math.atan2(
            this.touch.joystick.angle.current.y - this.touch.joystick.angle.center.y,
            this.touch.joystick.angle.current.x - this.touch.joystick.angle.center.x,
          )),
            (this.touch.joystick.angle.value =
              this.touch.joystick.angle.originalValue + this.touch.joystick.angle.offset));
          const e = Math.hypot(
            this.touch.joystick.angle.current.y - this.touch.joystick.angle.center.y,
            this.touch.joystick.angle.current.x - this.touch.joystick.angle.center.x,
          );
          let t = e;
          (t > 20 && (t = 20 + Math.log(e - 20) * 5), t > 43 && (t = 43));
          const n = Math.sin(this.touch.joystick.angle.originalValue + Math.PI * 0.5) * t,
            i = Math.cos(this.touch.joystick.angle.originalValue + Math.PI * 0.5) * t;
          this.touch.joystick.$cursor.style.transform = `translateX(${n}px) translateY(${i}px)`;
        }
      }),
      (this.touch.joystick.events = {}),
      (this.touch.joystick.touchIdentifier = null),
      (this.touch.joystick.events.touchstart = (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        t &&
          ((this.touch.joystick.active = !0),
          (this.touch.joystick.touchIdentifier = t.identifier),
          (this.touch.joystick.angle.current.x = t.clientX),
          (this.touch.joystick.angle.current.y = t.clientY),
          (this.touch.joystick.$limit.style.opacity = "0.5"),
          document.addEventListener("touchend", this.touch.joystick.events.touchend),
          document.addEventListener("touchmove", this.touch.joystick.events.touchmove, {
            passive: !1,
          }),
          this.trigger("joystickStart"));
      }),
      (this.touch.joystick.events.touchmove = (e) => {
        e.preventDefault();
        const n = [...e.changedTouches].find(
          (i) => i.identifier === this.touch.joystick.touchIdentifier,
        );
        n &&
          ((this.touch.joystick.angle.current.x = n.clientX),
          (this.touch.joystick.angle.current.y = n.clientY),
          this.trigger("joystickMove"));
      }),
      (this.touch.joystick.events.touchend = (e) => {
        [...e.changedTouches].find((i) => i.identifier === this.touch.joystick.touchIdentifier) &&
          ((this.touch.joystick.active = !1),
          (this.touch.joystick.$limit.style.opacity = "0.25"),
          (this.touch.joystick.$cursor.style.transform = "translateX(0px) translateY(0px)"),
          document.removeEventListener("touchend", this.touch.joystick.events.touchend),
          this.trigger("joystickEnd"));
      }),
      this.touch.joystick.$element.addEventListener(
        "touchstart",
        this.touch.joystick.events.touchstart,
        { passive: !1 },
      ),
      (this.touch.boost = {}),
      (this.touch.boost.$element = document.createElement("div")),
      (this.touch.boost.$element.style.userSelect = "none"),
      (this.touch.boost.$element.style.position = "fixed"),
      (this.touch.boost.$element.style.bottom = "calc(70px * 3 + 15px)"),
      (this.touch.boost.$element.style.right = "0px"),
      (this.touch.boost.$element.style.width = "95px"),
      (this.touch.boost.$element.style.height = "70px"),
      (this.touch.boost.$element.style.transition = "opacity 0.3s 0.4s"),
      (this.touch.boost.$element.style.willChange = "opacity"),
      (this.touch.boost.$element.style.opacity = "0"),
      document.body.appendChild(this.touch.boost.$element),
      (this.touch.boost.$border = document.createElement("div")),
      (this.touch.boost.$border.style.position = "absolute"),
      (this.touch.boost.$border.style.top = "calc(50% - 30px)"),
      (this.touch.boost.$border.style.left = "calc(50% - 30px)"),
      (this.touch.boost.$border.style.width = "60px"),
      (this.touch.boost.$border.style.height = "60px"),
      (this.touch.boost.$border.style.border = "2px solid #ffffff"),
      (this.touch.boost.$border.style.borderRadius = "10px"),
      (this.touch.boost.$border.style.boxSizing = "border-box"),
      (this.touch.boost.$border.style.opacity = "0.25"),
      (this.touch.boost.$border.style.willChange = "opacity"),
      this.touch.boost.$element.appendChild(this.touch.boost.$border),
      (this.touch.boost.$icon = document.createElement("div")),
      (this.touch.boost.$icon.style.position = "absolute"),
      (this.touch.boost.$icon.style.top = "calc(50% - 13px)"),
      (this.touch.boost.$icon.style.left = "calc(50% - 11px)"),
      (this.touch.boost.$icon.style.width = "22px"),
      (this.touch.boost.$icon.style.height = "26px"),
      (this.touch.boost.$icon.style.backgroundImage = `url(${touchCrossImage})`),
      (this.touch.boost.$icon.style.backgroundSize = "cover"),
      this.touch.boost.$element.appendChild(this.touch.boost.$icon),
      (this.touch.boost.events = {}),
      (this.touch.boost.touchIdentifier = null),
      (this.touch.boost.events.touchstart = (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        t &&
          (this.camera.pan.reset(),
          (this.touch.boost.touchIdentifier = t.identifier),
          (this.actions.up = !0),
          (this.actions.boost = !0),
          (this.touch.boost.$border.style.opacity = "0.5"),
          document.addEventListener("touchend", this.touch.boost.events.touchend));
      }),
      (this.touch.boost.events.touchend = (e) => {
        [...e.changedTouches].find((i) => i.identifier === this.touch.boost.touchIdentifier) &&
          ((this.actions.up = !1),
          (this.actions.boost = !1),
          (this.touch.boost.$border.style.opacity = "0.25"),
          document.removeEventListener("touchend", this.touch.boost.events.touchend));
      }),
      this.touch.boost.$element.addEventListener("touchstart", this.touch.boost.events.touchstart),
      (this.touch.forward = {}),
      (this.touch.forward.$element = document.createElement("div")),
      (this.touch.forward.$element.style.userSelect = "none"),
      (this.touch.forward.$element.style.position = "fixed"),
      (this.touch.forward.$element.style.bottom = "calc(70px * 2 + 15px)"),
      (this.touch.forward.$element.style.right = "0px"),
      (this.touch.forward.$element.style.width = "95px"),
      (this.touch.forward.$element.style.height = "70px"),
      (this.touch.forward.$element.style.transition = "opacity 0.3s 0.3s"),
      (this.touch.forward.$element.style.willChange = "opacity"),
      (this.touch.forward.$element.style.opacity = "0"),
      document.body.appendChild(this.touch.forward.$element),
      (this.touch.forward.$border = document.createElement("div")),
      (this.touch.forward.$border.style.position = "absolute"),
      (this.touch.forward.$border.style.top = "calc(50% - 30px)"),
      (this.touch.forward.$border.style.left = "calc(50% - 30px)"),
      (this.touch.forward.$border.style.width = "60px"),
      (this.touch.forward.$border.style.height = "60px"),
      (this.touch.forward.$border.style.border = "2px solid #ffffff"),
      (this.touch.forward.$border.style.borderRadius = "10px"),
      (this.touch.forward.$border.style.boxSizing = "border-box"),
      (this.touch.forward.$border.style.opacity = "0.25"),
      (this.touch.forward.$border.style.willChange = "opacity"),
      this.touch.forward.$element.appendChild(this.touch.forward.$border),
      (this.touch.forward.$icon = document.createElement("div")),
      (this.touch.forward.$icon.style.position = "absolute"),
      (this.touch.forward.$icon.style.top = "calc(50% - 9px)"),
      (this.touch.forward.$icon.style.left = "calc(50% - 11px)"),
      (this.touch.forward.$icon.style.width = "22px"),
      (this.touch.forward.$icon.style.height = "18px"),
      (this.touch.forward.$icon.style.backgroundImage = `url(${touchTriangleImage})`),
      (this.touch.forward.$icon.style.backgroundSize = "cover"),
      this.touch.forward.$element.appendChild(this.touch.forward.$icon),
      (this.touch.forward.events = {}),
      (this.touch.forward.touchIdentifier = null),
      (this.touch.forward.events.touchstart = (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        t &&
          (this.camera.pan.reset(),
          (this.touch.forward.touchIdentifier = t.identifier),
          (this.actions.up = !0),
          (this.touch.forward.$border.style.opacity = "0.5"),
          document.addEventListener("touchend", this.touch.forward.events.touchend));
      }),
      (this.touch.forward.events.touchend = (e) => {
        [...e.changedTouches].find((i) => i.identifier === this.touch.forward.touchIdentifier) &&
          ((this.actions.up = !1),
          (this.touch.forward.$border.style.opacity = "0.25"),
          document.removeEventListener("touchend", this.touch.forward.events.touchend));
      }),
      this.touch.forward.$element.addEventListener(
        "touchstart",
        this.touch.forward.events.touchstart,
      ),
      (this.touch.brake = {}),
      (this.touch.brake.$element = document.createElement("div")),
      (this.touch.brake.$element.style.userSelect = "none"),
      (this.touch.brake.$element.style.position = "fixed"),
      (this.touch.brake.$element.style.bottom = "calc(70px + 15px)"),
      (this.touch.brake.$element.style.right = "0px"),
      (this.touch.brake.$element.style.width = "95px"),
      (this.touch.brake.$element.style.height = "70px"),
      (this.touch.brake.$element.style.transition = "opacity 0.3s 0.2s"),
      (this.touch.brake.$element.style.willChange = "opacity"),
      (this.touch.brake.$element.style.opacity = "0"),
      document.body.appendChild(this.touch.brake.$element),
      (this.touch.brake.$border = document.createElement("div")),
      (this.touch.brake.$border.style.position = "absolute"),
      (this.touch.brake.$border.style.top = "calc(50% - 30px)"),
      (this.touch.brake.$border.style.left = "calc(50% - 30px)"),
      (this.touch.brake.$border.style.width = "60px"),
      (this.touch.brake.$border.style.height = "60px"),
      (this.touch.brake.$border.style.border = "2px solid #ffffff"),
      (this.touch.brake.$border.style.borderRadius = "10px"),
      (this.touch.brake.$border.style.boxSizing = "border-box"),
      (this.touch.brake.$border.style.opacity = "0.25"),
      (this.touch.brake.$border.style.willChange = "opacity"),
      this.touch.brake.$element.appendChild(this.touch.brake.$border),
      (this.touch.brake.$icon = document.createElement("div")),
      (this.touch.brake.$icon.style.position = "absolute"),
      (this.touch.brake.$icon.style.top = "calc(50% - 7px)"),
      (this.touch.brake.$icon.style.left = "calc(50% - 7px)"),
      (this.touch.brake.$icon.style.width = "15px"),
      (this.touch.brake.$icon.style.height = "15px"),
      (this.touch.brake.$icon.style.backgroundImage = `url(${touchDoubleTriangleImage})`),
      (this.touch.brake.$icon.style.backgroundSize = "cover"),
      (this.touch.brake.$icon.style.transform = "rotate(180deg)"),
      this.touch.brake.$element.appendChild(this.touch.brake.$icon),
      (this.touch.brake.events = {}),
      (this.touch.brake.touchIdentifier = null),
      (this.touch.brake.events.touchstart = (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        t &&
          ((this.touch.brake.touchIdentifier = t.identifier),
          (this.actions.brake = !0),
          (this.touch.brake.$border.style.opacity = "0.5"),
          document.addEventListener("touchend", this.touch.brake.events.touchend));
      }),
      (this.touch.brake.events.touchend = (e) => {
        [...e.changedTouches].find((i) => i.identifier === this.touch.brake.touchIdentifier) &&
          ((this.actions.brake = !1),
          (this.touch.brake.$border.style.opacity = "0.25"),
          document.removeEventListener("touchend", this.touch.brake.events.touchend));
      }),
      this.touch.brake.$element.addEventListener("touchstart", this.touch.brake.events.touchstart),
      (this.touch.backward = {}),
      (this.touch.backward.$element = document.createElement("div")),
      (this.touch.backward.$element.style.userSelect = "none"),
      (this.touch.backward.$element.style.position = "fixed"),
      (this.touch.backward.$element.style.bottom = "15px"),
      (this.touch.backward.$element.style.right = "0px"),
      (this.touch.backward.$element.style.width = "95px"),
      (this.touch.backward.$element.style.height = "70px"),
      (this.touch.backward.$element.style.transition = "opacity 0.3s 0.1s"),
      (this.touch.backward.$element.style.willChange = "opacity"),
      (this.touch.backward.$element.style.opacity = "0"),
      document.body.appendChild(this.touch.backward.$element),
      (this.touch.backward.$border = document.createElement("div")),
      (this.touch.backward.$border.style.position = "absolute"),
      (this.touch.backward.$border.style.top = "calc(50% - 30px)"),
      (this.touch.backward.$border.style.left = "calc(50% - 30px)"),
      (this.touch.backward.$border.style.width = "60px"),
      (this.touch.backward.$border.style.height = "60px"),
      (this.touch.backward.$border.style.border = "2px solid #ffffff"),
      (this.touch.backward.$border.style.borderRadius = "10px"),
      (this.touch.backward.$border.style.boxSizing = "border-box"),
      (this.touch.backward.$border.style.opacity = "0.25"),
      (this.touch.backward.$border.style.willChange = "opacity"),
      this.touch.backward.$element.appendChild(this.touch.backward.$border),
      (this.touch.backward.$icon = document.createElement("div")),
      (this.touch.backward.$icon.style.position = "absolute"),
      (this.touch.backward.$icon.style.top = "calc(50% - 9px)"),
      (this.touch.backward.$icon.style.left = "calc(50% - 11px)"),
      (this.touch.backward.$icon.style.width = "22px"),
      (this.touch.backward.$icon.style.height = "18px"),
      (this.touch.backward.$icon.style.backgroundImage = `url(${touchTriangleImage})`),
      (this.touch.backward.$icon.style.backgroundSize = "cover"),
      (this.touch.backward.$icon.style.transform = "rotate(180deg)"),
      this.touch.backward.$element.appendChild(this.touch.backward.$icon),
      (this.touch.backward.events = {}),
      (this.touch.backward.touchIdentifier = null),
      (this.touch.backward.events.touchstart = (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        t &&
          (this.camera.pan.reset(),
          (this.touch.backward.touchIdentifier = t.identifier),
          (this.actions.down = !0),
          (this.touch.backward.$border.style.opacity = "0.5"),
          document.addEventListener("touchend", this.touch.backward.events.touchend));
      }),
      (this.touch.backward.events.touchend = (e) => {
        [...e.changedTouches].find((i) => i.identifier === this.touch.backward.touchIdentifier) &&
          ((this.actions.down = !1),
          (this.touch.backward.$border.style.opacity = "0.25"),
          document.removeEventListener("touchend", this.touch.backward.events.touchend));
      }),
      this.touch.backward.$element.addEventListener(
        "touchstart",
        this.touch.backward.events.touchstart,
      ),
      (this.touch.reveal = () => {
        ((this.touch.joystick.$element.style.opacity = 1),
          (this.touch.backward.$element.style.opacity = 1),
          (this.touch.brake.$element.style.opacity = 1),
          (this.touch.forward.$element.style.opacity = 1),
          (this.touch.boost.$element.style.opacity = 1));
      }));
  }
}
class Sounds {
  constructor(e) {
    ((this.time = e.time),
      (this.debug = e.debug),
      this.debug && (this.debugFolder = this.debug.addFolder("sounds")),
      (this.items = []),
      this.setSettings(),
      this.setMasterVolume(),
      this.setMute(),
      this.setEngine());
  }
  setSettings() {
    this.settings = [
      {
        name: "reveal",
        sounds: ["./sounds/reveal/reveal-1.mp3"],
        minDelta: 100,
        velocityMin: 0,
        velocityMultiplier: 1,
        volumeMin: 1,
        volumeMax: 1,
        rateMin: 1,
        rateMax: 1,
      },
      {
        name: "brick",
        sounds: [
          "./sounds/bricks/brick-1.mp3",
          "./sounds/bricks/brick-2.mp3",
          "./sounds/bricks/brick-4.mp3",
          "./sounds/bricks/brick-6.mp3",
          "./sounds/bricks/brick-7.mp3",
          "./sounds/bricks/brick-8.mp3",
        ],
        minDelta: 100,
        velocityMin: 1,
        velocityMultiplier: 0.75,
        volumeMin: 0.2,
        volumeMax: 0.85,
        rateMin: 0.5,
        rateMax: 0.75,
      },
      {
        name: "bowlingPin",
        sounds: ["./sounds/bowling/pin-1.mp3"],
        minDelta: 0,
        velocityMin: 1,
        velocityMultiplier: 0.5,
        volumeMin: 0.35,
        volumeMax: 1,
        rateMin: 0.1,
        rateMax: 0.85,
      },
      {
        name: "bowlingBall",
        sounds: [
          "./sounds/bowling/pin-1.mp3",
          "./sounds/bowling/pin-1.mp3",
          "./sounds/bowling/pin-1.mp3",
        ],
        minDelta: 0,
        velocityMin: 1,
        velocityMultiplier: 0.5,
        volumeMin: 0.35,
        volumeMax: 1,
        rateMin: 0.1,
        rateMax: 0.2,
      },
      {
        name: "carHit",
        sounds: [
          "./sounds/car-hits/car-hit-1.mp3",
          "./sounds/car-hits/car-hit-3.mp3",
          "./sounds/car-hits/car-hit-4.mp3",
          "./sounds/car-hits/car-hit-5.mp3",
        ],
        minDelta: 100,
        velocityMin: 2,
        velocityMultiplier: 1,
        volumeMin: 0.2,
        volumeMax: 0.6,
        rateMin: 0.35,
        rateMax: 0.55,
      },
      {
        name: "woodHit",
        sounds: ["./sounds/wood-hits/wood-hit-1.mp3"],
        minDelta: 30,
        velocityMin: 1,
        velocityMultiplier: 1,
        volumeMin: 0.5,
        volumeMax: 1,
        rateMin: 0.75,
        rateMax: 1.5,
      },
      {
        name: "screech",
        sounds: ["./sounds/screeches/screech-1.mp3"],
        minDelta: 1e3,
        velocityMin: 0,
        velocityMultiplier: 1,
        volumeMin: 0.75,
        volumeMax: 1,
        rateMin: 0.9,
        rateMax: 1.1,
      },
      {
        name: "uiArea",
        sounds: ["./sounds/ui/area-1.mp3"],
        minDelta: 100,
        velocityMin: 0,
        velocityMultiplier: 1,
        volumeMin: 0.75,
        volumeMax: 1,
        rateMin: 0.95,
        rateMax: 1.05,
      },
      {
        name: "carHorn1",
        sounds: ["./sounds/car-horns/car-horn-1.mp3"],
        minDelta: 0,
        velocityMin: 0,
        velocityMultiplier: 1,
        volumeMin: 0.95,
        volumeMax: 1,
        rateMin: 1,
        rateMax: 1,
      },
      {
        name: "carHorn2",
        sounds: ["./sounds/car-horns/car-horn-2.mp3"],
        minDelta: 0,
        velocityMin: 0,
        velocityMultiplier: 1,
        volumeMin: 0.95,
        volumeMax: 1,
        rateMin: 1,
        rateMax: 1,
      },
      {
        name: "horn",
        sounds: [
          "./sounds/horns/horn-1.mp3",
          "./sounds/horns/horn-2.mp3",
          "./sounds/horns/horn-3.mp3",
        ],
        minDelta: 100,
        velocityMin: 1,
        velocityMultiplier: 0.75,
        volumeMin: 0.5,
        volumeMax: 1,
        rateMin: 0.75,
        rateMax: 1,
      },
    ];
    for (const e of this.settings) this.add(e);
  }
  setMasterVolume() {
    ((this.masterVolume = 0.5),
      ui.Howler.volume(this.masterVolume),
      window.requestAnimationFrame(() => {
        ui.Howler.volume(this.masterVolume);
      }),
      this.debug &&
        this.debugFolder
          .add(this, "masterVolume")
          .step(0.001)
          .min(0)
          .max(1)
          .onChange(() => {
            ui.Howler.volume(this.masterVolume);
          }));
  }
  setMute() {
    ((this.muted = typeof this.debug < "u"),
      ui.Howler.mute(this.muted),
      window.addEventListener("keydown", (e) => {
        e.key === "m" && ((this.muted = !this.muted), ui.Howler.mute(this.muted));
      }),
      document.addEventListener("visibilitychange", () => {
        document.hidden ? ui.Howler.mute(!0) : ui.Howler.mute(this.muted);
      }),
      this.debug &&
        this.debugFolder
          .add(this, "muted")
          .listen()
          .onChange(() => {
            ui.Howler.mute(this.muted);
          }));
  }
  setEngine() {
    if (
      ((this.engine = {}),
      (this.engine.progress = 0),
      (this.engine.progressEasingUp = 0.3),
      (this.engine.progressEasingDown = 0.15),
      (this.engine.speed = 0),
      (this.engine.speedMultiplier = 2.5),
      (this.engine.acceleration = 0),
      (this.engine.accelerationMultiplier = 0.4),
      (this.engine.rate = {}),
      (this.engine.rate.min = 0.4),
      (this.engine.rate.max = 1.4),
      (this.engine.volume = {}),
      (this.engine.volume.min = 0.4),
      (this.engine.volume.max = 1),
      (this.engine.volume.master = 0),
      (this.engine.sound = new ui.Howl({ src: ["./sounds/engines/1/low_off.mp3"], loop: !0 })),
      this.engine.sound.play(),
      this.time.on("tick", () => {
        let e =
          Math.abs(this.engine.speed) * this.engine.speedMultiplier +
          Math.max(this.engine.acceleration, 0) * this.engine.accelerationMultiplier;
        ((e = Math.min(Math.max(e, 0), 1)),
          (this.engine.progress +=
            (e - this.engine.progress) *
            this.engine[e > this.engine.progress ? "progressEasingUp" : "progressEasingDown"]));
        const t = this.engine.rate.max - this.engine.rate.min;
        this.engine.sound.rate(this.engine.rate.min + t * this.engine.progress);
        const n = this.engine.volume.max - this.engine.volume.min;
        this.engine.sound.volume(
          (this.engine.volume.min + n * this.engine.progress) * this.engine.volume.master,
        );
      }),
      this.debug)
    ) {
      const e = this.debugFolder.addFolder("engine");
      (e.open(),
        e.add(this.engine, "progressEasingUp").step(0.001).min(0).max(1).name("progressEasingUp"),
        e
          .add(this.engine, "progressEasingDown")
          .step(0.001)
          .min(0)
          .max(1)
          .name("progressEasingDown"),
        e.add(this.engine.rate, "min").step(0.001).min(0).max(4).name("rateMin"),
        e.add(this.engine.rate, "max").step(0.001).min(0).max(4).name("rateMax"),
        e.add(this.engine, "speedMultiplier").step(0.01).min(0).max(5).name("speedMultiplier"),
        e
          .add(this.engine, "accelerationMultiplier")
          .step(0.01)
          .min(0)
          .max(100)
          .name("accelerationMultiplier"),
        e.add(this.engine, "progress").step(0.01).min(0).max(1).name("progress").listen());
    }
  }
  add(e) {
    const t = {
      name: e.name,
      minDelta: e.minDelta,
      velocityMin: e.velocityMin,
      velocityMultiplier: e.velocityMultiplier,
      volumeMin: e.volumeMin,
      volumeMax: e.volumeMax,
      rateMin: e.rateMin,
      rateMax: e.rateMax,
      lastTime: 0,
      sounds: [],
    };
    for (const n of e.sounds) {
      const i = new ui.Howl({ src: [n] });
      t.sounds.push(i);
    }
    this.items.push(t);
  }
  play(e, t) {
    const n = this.items.find((r) => r.name === e),
      i = Date.now(),
      s = typeof t > "u" ? 0 : t;
    if (n && i > n.lastTime + n.minDelta && (n.velocityMin === 0 || s > n.velocityMin)) {
      const r = n.sounds[Math.floor(Math.random() * n.sounds.length)];
      let a = Math.min(
        Math.max((s - n.velocityMin) * n.velocityMultiplier, n.volumeMin),
        n.volumeMax,
      );
      ((a = Math.pow(a, 2)), r.volume(a));
      const c = n.rateMax - n.rateMin;
      (r.rate(n.rateMin + Math.random() * c), r.play(), (n.lastTime = i));
    }
  }
}
class EasterEggs {
  constructor(e) {
    ((this.resources = e.resources),
      (this.car = e.car),
      (this.walls = e.walls),
      (this.objects = e.objects),
      (this.materials = e.materials),
      (this.areas = e.areas),
      (this.config = e.config),
      (this.physics = e.physics),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.setKonamiCode(),
      this.setWigs());
  }
  setKonamiCode() {
    ((this.konamiCode = {}),
      (this.konamiCode.x = -60),
      (this.konamiCode.y = -100),
      (this.konamiCode.sequence = [
        "ArrowUp",
        "ArrowUp",
        "ArrowDown",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowLeft",
        "ArrowRight",
      ]),
      this.config.touch || this.konamiCode.sequence.push("b", "a"),
      (this.konamiCode.keyIndex = 0),
      (this.konamiCode.latestKeys = []),
      (this.konamiCode.count = 0),
      this.config.touch
        ? (this.konamiCode.labelTexture = this.resources.items.konamiLabelTouchTexture)
        : (this.konamiCode.labelTexture = this.resources.items.konamiLabelTexture),
      (this.konamiCode.labelTexture.magFilter = NearestFilter),
      (this.konamiCode.labelTexture.minFilter = LinearFilter),
      (this.konamiCode.label = new Mesh(
        new PlaneGeometry(8, 8 / 16),
        new MeshBasicMaterial({
          transparent: !0,
          depthWrite: !1,
          color: 16777215,
          alphaMap: this.konamiCode.labelTexture,
        }),
      )),
      (this.konamiCode.label.position.x = this.konamiCode.x + 5),
      (this.konamiCode.label.position.y = this.konamiCode.y),
      (this.konamiCode.label.matrixAutoUpdate = !1),
      this.konamiCode.label.updateMatrix(),
      this.container.add(this.konamiCode.label),
      (this.konamiCode.lemonOption = {
        base: this.resources.items.lemonBase.scene,
        collision: this.resources.items.lemonCollision.scene,
        offset: new Vector3(0, 0, 0),
        rotation: new Euler(Math.PI * 0.5, -Math.PI * 0.3, 0),
        duplicated: !0,
        shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: -0.15, alpha: 0.35 },
        mass: 0.5,
        sleep: !0,
        soundName: "woodHit",
      }),
      this.objects.add({
        ...this.konamiCode.lemonOption,
        offset: new Vector3(this.konamiCode.x, this.konamiCode.y, 0.4),
      }),
      (this.konamiCode.testInput = (e) => {
        if (
          (this.konamiCode.latestKeys.push(e),
          this.konamiCode.latestKeys.length > this.konamiCode.sequence.length &&
            this.konamiCode.latestKeys.shift(),
          this.konamiCode.sequence.toString() === this.konamiCode.latestKeys.toString())
        ) {
          this.konamiCode.count++;
          for (let t = 0; t < Math.pow(3, this.konamiCode.count); t++)
            window.setTimeout(() => {
              const n = this.car.chassis.object.position.x + (Math.random() - 0.5) * 10,
                i = this.car.chassis.object.position.y + (Math.random() - 0.5) * 10;
              this.objects.add({
                ...this.konamiCode.lemonOption,
                offset: new Vector3(n, i, 10),
                rotation: new Euler(
                  Math.random() * Math.PI * 2,
                  Math.random() * Math.PI * 2,
                  Math.random() * Math.PI * 2,
                ),
                sleep: !1,
              });
            }, t * 50);
        }
      }),
      window.addEventListener("keydown", (e) => {
        this.konamiCode.testInput(e.key);
      }),
      (this.konamiCode.touch = {}),
      (this.konamiCode.touch.x = 0),
      (this.konamiCode.touch.y = 0),
      (this.konamiCode.touch.touchstart = (e) => {
        (window.addEventListener("touchend", this.konamiCode.touch.touchend),
          (this.konamiCode.touch.x = e.changedTouches[0].clientX),
          (this.konamiCode.touch.y = e.changedTouches[0].clientY));
      }),
      (this.konamiCode.touch.touchend = (e) => {
        window.removeEventListener("touchend", this.konamiCode.touch.touchend);
        const t = e.changedTouches[0].clientX,
          n = e.changedTouches[0].clientY,
          i = t - this.konamiCode.touch.x,
          s = n - this.konamiCode.touch.y;
        if (Math.hypot(i, s) > 30) {
          const a = Math.atan2(s, i);
          let c = null;
          (a < -Math.PI * 0.75
            ? (c = "ArrowLeft")
            : a < -Math.PI * 0.25
              ? (c = "ArrowUp")
              : a < Math.PI * 0.25
                ? (c = "ArrowRight")
                : a < Math.PI * 0.75
                  ? (c = "ArrowDown")
                  : (c = "ArrowLeft"),
            this.konamiCode.testInput(c));
        }
      }),
      window.addEventListener("touchstart", this.konamiCode.touch.touchstart));
  }
  setWigs() {
    ((this.wigs = {}),
      (this.wigs.currentWig = null),
      (this.wigs.container = new Object3D()),
      (this.wigs.container.position.x = -0.1),
      (this.wigs.container.position.y = -30),
      (this.wigs.container.matrixAutoUpdate = !1),
      this.wigs.container.updateMatrix(),
      this.container.add(this.wigs.container),
      (this.wigs.materials = [
        this.materials.shades.items.green,
        this.materials.shades.items.red,
        this.materials.shades.items.emeraldGreen,
        this.materials.shades.items.purple,
        this.materials.shades.items.yellow,
        this.materials.shades.items.white,
      ]),
      (this.wigs.list = [
        this.resources.items.wig1,
        this.resources.items.wig2,
        this.resources.items.wig3,
        this.resources.items.wig4,
      ]),
      (this.wigs.items = []));
    for (const e of this.wigs.list) {
      const t = new Object3D();
      ((t.visible = !1), (t.matrixAutoUpdate = !1), this.wigs.container.add(t));
      const n = [...e.scene.children];
      for (const i of n) ((i.material = this.wigs.materials[0]), t.add(i));
      this.wigs.items.push(t);
    }
    ((this.wigs.change = () => {
      this.wigs.currentWig && (this.wigs.currentWig.visible = !1);
      let e = null;
      do e = this.wigs.items[Math.floor(Math.random() * this.wigs.items.length)];
      while (this.wigs.currentWig === e);
      ((this.wigs.currentWig = e), (this.wigs.currentWig.visible = !0));
      const t = this.wigs.materials[Math.floor(Math.random() * this.wigs.materials.length)];
      for (const n of this.wigs.currentWig.children) n.material = t;
    }),
      (this.wigs.area = this.areas.add({
        position: new Vector2(0, 80),
        halfExtents: new Vector2(2, 2),
      })),
      this.wigs.area.on("interact", this.wigs.change),
      (this.resources.items.areaQuestionMarkTexture.magFilter = NearestFilter),
      (this.resources.items.areaQuestionMarkTexture.minFilter = LinearFilter),
      (this.wigs.areaLabel = new Mesh(
        new PlaneGeometry(1, 1),
        new MeshBasicMaterial({
          transparent: !0,
          depthWrite: !1,
          color: 16777215,
          alphaMap: this.resources.items.areaQuestionMarkTexture,
        }),
      )),
      (this.wigs.areaLabel.position.x = 0),
      (this.wigs.areaLabel.position.y = 80),
      (this.wigs.areaLabel.matrixAutoUpdate = !1),
      this.wigs.areaLabel.updateMatrix(),
      this.container.add(this.wigs.areaLabel));
  }
  setEggs() {
    ((this.eggs = {}), (this.eggs.items = []), console.log("🥚 2021eggbvpoabe"));
    const e = [
      {
        offset: new Vector3(-29.8, -18.94, 0.5),
        material: this.materials.shades.items.emeraldGreen,
        code: "MjAyMWVnZ2Fvem5kZXo=",
      },
      {
        offset: new Vector3(103.91, 128.56, 0.5),
        material: this.materials.shades.items.red,
        code: "MjAyMWVnZ3Fxc3ZwcG8=",
      },
      {
        offset: new Vector3(39.68, -23.67, 0.5),
        material: this.materials.shades.items.purple,
        code: "MjAyMWVnZ212b2Focnc=",
      },
      {
        offset: new Vector3(107.62, -155.75, 0.5),
        material: this.materials.shades.items.blue,
        code: "MjAyMWVnZ2N1ZHBhaW4=",
      },
    ];
    this.eggs.add = (t) => {
      const n = {};
      ((n.found = !1),
        (n.code = t.code),
        (n.object = this.objects.add({
          base: this.resources.items.eggBase.scene,
          collision: this.resources.items.eggCollision.scene,
          duplicated: !0,
          shadow: { sizeX: 1.2, sizeY: 1.8, offsetZ: -0.15, alpha: 0.35 },
          mass: 0.5,
          sleep: typeof t.sleep < "u" ? t.sleep : !0,
          soundName: "woodHit",
          offset: t.offset,
          rotation: typeof t.sleep < "u" ? t.rotation : new Euler(0, 0, 0),
        })),
        (n.object.container.children[0].material = t.material),
        (n.collisionCallback = (i) => {
          if (i.body === this.physics.car.chassis.body && !n.found) {
            n.found = !0;
            const s = atob(n.code);
            window.setTimeout(() => {
              (window.alert(`
You found a hidden GitSkins collectible.
Keep exploring this portfolio to discover more.
${s}
                        `),
                window.setTimeout(() => {
                  n.found = !1;
                }, 1e3));
            }, 600);
          }
        }),
        n.object.collision.body.addEventListener("collide", n.collisionCallback),
        this.eggs.items.push(n));
    };
    for (const t of e) this.eggs.add(t);
  }
}
class World {
  constructor(e) {
    ((this.config = e.config),
      (this.debug = e.debug),
      (this.resources = e.resources),
      (this.time = e.time),
      (this.sizes = e.sizes),
      (this.camera = e.camera),
      (this.scene = e.scene),
      (this.renderer = e.renderer),
      (this.passes = e.passes),
      this.debug && ((this.debugFolder = this.debug.addFolder("world")), this.debugFolder.open()),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      this.setSounds(),
      this.setControls(),
      this.setFloor(),
      this.setAreas(),
      this.setStartingScreen());
  }
  start() {
    (window.setTimeout(() => {
      this.camera.pan.enable();
    }, 2e3),
      this.setReveal(),
      this.setMaterials(),
      this.setShadows(),
      this.setPhysics(),
      this.setZones(),
      this.setObjects(),
      this.setCar(),
      (this.areas.car = this.car),
      this.setTiles(),
      this.setWalls(),
      this.setSections(),
      this.setEasterEggs());
  }
  setReveal() {
    ((this.reveal = {}),
      (this.reveal.matcapsProgress = 0),
      (this.reveal.floorShadowsProgress = 0),
      (this.reveal.previousMatcapsProgress = null),
      (this.reveal.previousFloorShadowsProgress = null),
      (this.reveal.go = () => {
        (gsap.fromTo(this.reveal, { matcapsProgress: 0 }, { matcapsProgress: 1, duration: 3 }),
          gsap.fromTo(
            this.reveal,
            { floorShadowsProgress: 0 },
            { floorShadowsProgress: 1, duration: 3, delay: 0.5 },
          ),
          gsap.fromTo(this.shadows, { alpha: 0 }, { alpha: 0.5, duration: 3, delay: 0.5 }),
          this.sections.intro &&
            (gsap.fromTo(
              this.sections.intro.instructions.arrows.label.material,
              { opacity: 0 },
              { opacity: 1, duration: 0.3, delay: 0.5 },
            ),
            this.sections.intro.otherInstructions &&
              gsap.fromTo(
                this.sections.intro.otherInstructions.label.material,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, delay: 0.75 },
              )),
          this.physics.car.chassis.body.sleep(),
          this.physics.car.chassis.body.position.set(0, 0, 12),
          window.setTimeout(() => {
            this.physics.car.chassis.body.wakeUp();
          }, 300),
          gsap.fromTo(
            this.sounds.engine.volume,
            { master: 0 },
            { master: 0.7, duration: 0.5, delay: 0.3, ease: "power2.in" },
          ),
          window.setTimeout(() => {
            this.sounds.play("reveal");
          }, 400),
          this.controls.touch &&
            window.setTimeout(() => {
              this.controls.touch.reveal();
            }, 400));
      }),
      this.time.on("tick", () => {
        if (this.reveal.matcapsProgress !== this.reveal.previousMatcapsProgress) {
          for (const e in this.materials.shades.items) {
            const t = this.materials.shades.items[e];
            t.uniforms.uRevealProgress.value = this.reveal.matcapsProgress;
          }
          this.reveal.previousMatcapsProgress = this.reveal.matcapsProgress;
        }
        if (this.reveal.floorShadowsProgress !== this.reveal.previousFloorShadowsProgress) {
          for (const e of this.objects.floorShadows)
            e.material.uniforms.uAlpha.value = this.reveal.floorShadowsProgress;
          this.reveal.previousFloorShadowsProgress = this.reveal.floorShadowsProgress;
        }
      }),
      this.debug &&
        (this.debugFolder
          .add(this.reveal, "matcapsProgress")
          .step(1e-4)
          .min(0)
          .max(1)
          .name("matcapsProgress"),
        this.debugFolder
          .add(this.reveal, "floorShadowsProgress")
          .step(1e-4)
          .min(0)
          .max(1)
          .name("floorShadowsProgress"),
        this.debugFolder.add(this.reveal, "go").name("reveal")));
  }
  setStartingScreen() {
    ((this.startingScreen = {}),
      (this.startingScreen.area = this.areas.add({
        position: new Vector2(0, 0),
        halfExtents: new Vector2(2.35, 1.5),
        hasKey: !1,
        testCar: !1,
        active: !1,
      })),
      (this.startingScreen.loadingLabel = {}),
      (this.startingScreen.loadingLabel.geometry = new PlaneGeometry(2.5, 2.5 / 4)),
      (this.startingScreen.loadingLabel.image = new Image()),
      (this.startingScreen.loadingLabel.image.src =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///9ra2ucnJzR0dH09PQmJiaNjY24uLjp6end3d1CQkLFxcVYWFiqqqp9fX3nQ5qrAAAEVUlEQVRo3u3YT08TQRQA8JEtW6CATGnDdvljaTwYE2IBI/HGRrwSetGTsZh4MPFQYiQe229gE++WePFY9Oqh1cRzieEDYIgXLxjPJu5M33vbZQszW+fgoS+B7ewO836znRl2lg1jGMP4P2Okw0yFvaKsklr3I99Tvl3iPPelGbQhKqxB4eN6N/7gVcsvbEAz1F4RLn67zzl/v6/oLvejGBQ9LsNphio4UFjmEAsVJuOK/zkDtc6w+gyTcZ3LyP6IAzjBDA+pj6LkEgAjW4kANsMAC6vmOvqAMU5RgVOTskQACicCmCcA9AXjkT5gj1MswqlxWcoTgKJ6HuAQAD5guNoAu8QpMnBul1ONMGD2PCBbRgDAKYq6AEtmXvtdj3S6GhRyW1t1DvkAgM0ggG7mu1t3xWFHFzAqv3wYCi0mY1UCGgiQPU+1oWIY8LoXcAA3qeYfr+kClvHW14PJ5OfCAgHYNAoDAORBQIrDvHjqH5c0ANTbORzBacbAQgUC2IAKAzI9gCSHlWEMLmgBPJxMvyARpIICALDm4nkAbwIA71EZx5UOgO48JnLoOhQIAN9sOgKoBoAE5r0aB8ARcNhtFzrg0VQmwCp8CAMeAADGc44S5GMBsF1aCEU2LcAcAPDCvwFytBDehCaUgJxRAKeF8BNUUQJ43iiAUlqwFKoBrTCAHjiagwEgU0YM5IYWYD4KoIgPwIXQwUbVgCXzgLpIBJNeDciWTQNskVsq1ADX/6kYBdCTjse5owbMiX+IpgGWOCPSuWpA2vN/TAMm5QTYg5IC4FdbMA0YF5Nb5s2rAaLyhzBgektGZWDArrgqi0U1QHxf38OABDwUDgTAjGfyPlTVgJT/67FBACbqyGYaaoBctQwD2vI4DecVAPkgZRhQlxPQks2rAePGAbZsRlaa1QBYEQBUHRCAmaXD0QDYxgFWdye05R9cDQCrmQYkeBA6gGXTgNEeQF4DMG4S4MLjOUZRA5A0CcjADgmjqgGwSwSg9wK1GIBS74KTgTxv/EHoiaVQsTOS5RoCJuiZyosB8EIrHpyowFiYofO0i4wCjhCQwL0hq2sCaFNM22S4JXloLk0AuLDTBzCBAAt3xykeA7CHe/mDbgdTvQ9GswSAwdbqA0giYASHjQUJnhQKhQ6z/d8rDA4hAG2Dsk042ejubHMM2nV6AMf93pCkaRjhh0WsWuz+6aasl2FwiAImReEts1/CSaFfwFouAJxC4RW+I4oCThBQE1X2WbKkBFDkqYDtJ0SHaYKq3pJJwCECjjiFPoC1w+2P0gumurgeBjT6AhIIGKOelGIAngWlFnRnMZjMIYBb7gtIIsAuYU+8GICpEhYyZVgIZ2g9rYYAX1lfAKvjnxzjnWrHALDn9K1h2k2aoI1ewGd2AWAVAVMHcKdW4wDYje739pNufJXhkJohgLu9zy4CHCKAJYUge4ddCojGyPrp9kaHmYjUi9N7+2wYwxjGZfEXMKxGE0GkkfIAAAAASUVORK5CYII="),
      (this.startingScreen.loadingLabel.texture = new Texture(
        this.startingScreen.loadingLabel.image,
      )),
      (this.startingScreen.loadingLabel.texture.magFilter = NearestFilter),
      (this.startingScreen.loadingLabel.texture.minFilter = LinearFilter),
      (this.startingScreen.loadingLabel.texture.needsUpdate = !0),
      (this.startingScreen.loadingLabel.material = new MeshBasicMaterial({
        transparent: !0,
        depthWrite: !1,
        color: 16777215,
        alphaMap: this.startingScreen.loadingLabel.texture,
      })),
      (this.startingScreen.loadingLabel.mesh = new Mesh(
        this.startingScreen.loadingLabel.geometry,
        this.startingScreen.loadingLabel.material,
      )),
      (this.startingScreen.loadingLabel.mesh.matrixAutoUpdate = !1),
      this.container.add(this.startingScreen.loadingLabel.mesh),
      (this.startingScreen.startLabel = {}),
      (this.startingScreen.startLabel.geometry = new PlaneGeometry(2.5, 2.5 / 4)),
      (this.startingScreen.startLabel.image = new Image()),
      (this.startingScreen.startLabel.image.src =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAABABAMAAAAHc7SNAAAAMFBMVEUAAAD///+cnJxra2vR0dHd3d0mJib09PRYWFjp6em4uLhCQkKqqqqNjY19fX3FxcV3XeRgAAADsklEQVRo3u3YsU9TQRwH8KNgLSDQg9ZCAak1IdE4PKPu1NTEsSzOMDl3I3GpcXAxBhLjXFxNjJgQJ2ON0Rnj4uAAEyv8B/L7tV++5/VN+CM69Ldwfa+534d7d793VzeIQQzi/49c4v5lPF/1vvhFm++rjIpcyErrmrSCuz+cxng1iL/If8drPJD2Lc/Iy4VhaZWlFd4tLPfuMc6e/5LvRilJA2SkVSQA8c0OsI0uNtIAU9rsB8y1rAAZjyimAUa1mQDAeGwF+MA+9lIA69qs9AMKVoDP8vhf35A+NiMAc7YJKFSrX7tcI8BW9+k/O/kz6zSunjSnncMHiQYBcmdXrh3xCVbc2WO8N/YZZI0AxxwMArKivmwAwFKSPmV0UwBbCpj5E+C+yzUbQAaJVwUSA9SFjwFgHQ0jAMrBWgzAPCtHgFFbQAlpEwKC2zWUQgJGbAH+naSdu/fTxQAthPL5/ADD6OCpQwCAsb6LsbEGcBluOAYBmG2fkMIawHVWXEsDIGUGpZCAIRsAS93DPgDbhUmUQgKe2NUB90hfhK0YwEJYHkYpJGDbqBKiB86CGLAlzd6/S8CEvh8sACiBvrSXCshKblWEgNy2vkAMAHwGfjECcJHOu5qUQgDm6vXulshZAXJNL9GJAeg+LxeKPQBj1gzgdlnuCWAhbOi7LwaU9u0A2VWPpUgAC+GR5k0iwBtnB3Bj3qMaRYB17X0IOQhYcjYA7guxxyIAGfd1HNqchPfly7aACQUshAA2W1r5G1yG415YpgB3qIIkAHBH2D075QnQ10fHDsCl+CoGSKpiN8kMAVqIN00BsitnVgKyPIBMB4ADKU92AA5BKQIgszjKBGBLagpwB5xZBGS6pbcuizQAXMA6NAK86OCQ3okAI55BQPe7VoDxXzU/iwPASgS4GAASAiYxWgYAzvAa1loA2AkAFQIU2zEELCJtDDgIAG0CFLvp7LblC2kAtF6eTEJJ2CBAr88bAXKY4WkASbzXmwt5AvTvohHA4WSUBmj2Jt+IThQChrAOLQC13vPFMAOAQwuyTAeAKVQto3OBDOdESh2YxNZPbpYBQNbEAoBfod7e1i1BiwB0voSZWgwAOWgtAGPhD18E8ASIiRIAXNPwXJBtcqMbAFAIr5weIJMAcIx1aAAIqk0lAuycompyFwBMHAsAZlj/lgw0rsy2AkhbsgK4Q+70CUBjxeFXsUb0G1HJDJC9rketZRcCWCJwHM8DgJm7b7ch+XizXm25QQxiEOcXvwGCWOhbCZC0qAAAAABJRU5ErkJggg=="),
      (this.startingScreen.startLabel.texture = new Texture(this.startingScreen.startLabel.image)),
      (this.startingScreen.startLabel.texture.magFilter = NearestFilter),
      (this.startingScreen.startLabel.texture.minFilter = LinearFilter),
      (this.startingScreen.startLabel.texture.needsUpdate = !0),
      (this.startingScreen.startLabel.material = new MeshBasicMaterial({
        transparent: !0,
        depthWrite: !1,
        color: 16777215,
        alphaMap: this.startingScreen.startLabel.texture,
      })),
      (this.startingScreen.startLabel.material.opacity = 0),
      (this.startingScreen.startLabel.mesh = new Mesh(
        this.startingScreen.startLabel.geometry,
        this.startingScreen.startLabel.material,
      )),
      (this.startingScreen.startLabel.mesh.matrixAutoUpdate = !1),
      this.container.add(this.startingScreen.startLabel.mesh),
      this.resources.on("progress", (e) => {
        ((this.startingScreen.area.floorBorder.material.uniforms.uAlpha.value = 1),
          (this.startingScreen.area.floorBorder.material.uniforms.uLoadProgress.value = e));
      }),
      this.resources.on("ready", () => {
        window.requestAnimationFrame(() => {
          (this.startingScreen.area.activate(),
            gsap.to(this.startingScreen.area.floorBorder.material.uniforms.uAlpha, {
              value: 0.3,
              duration: 0.3,
            }),
            gsap.to(this.startingScreen.loadingLabel.material, { opacity: 0, duration: 0.3 }),
            gsap.to(this.startingScreen.startLabel.material, {
              opacity: 1,
              duration: 0.3,
              delay: 0.3,
            }));
        });
      }),
      this.startingScreen.area.on("interact", () => {
        (this.startingScreen.area.deactivate(),
          gsap.to(this.startingScreen.area.floorBorder.material.uniforms.uProgress, {
            value: 0,
            duration: 0.3,
            delay: 0.4,
          }),
          gsap.to(this.startingScreen.startLabel.material, {
            opacity: 0,
            duration: 0.3,
            delay: 0.4,
          }),
          this.start(),
          window.setTimeout(() => {
            this.reveal.go();
          }, 600));
      }));
  }
  setSounds() {
    this.sounds = new Sounds({ debug: this.debugFolder, time: this.time });
  }
  setAxes() {
    ((this.axis = new AxesHelper()), this.container.add(this.axis));
  }
  setControls() {
    this.controls = new Controls({
      config: this.config,
      sizes: this.sizes,
      time: this.time,
      camera: this.camera,
      sounds: this.sounds,
    });
  }
  setMaterials() {
    this.materials = new Materials({ resources: this.resources, debug: this.debugFolder });
  }
  setFloor() {
    ((this.floor = new Floor({ debug: this.debugFolder })),
      this.container.add(this.floor.container));
  }
  setShadows() {
    ((this.shadows = new Shadows({
      time: this.time,
      debug: this.debugFolder,
      renderer: this.renderer,
      camera: this.camera,
    })),
      this.container.add(this.shadows.container));
  }
  setPhysics() {
    ((this.physics = new Physics({
      config: this.config,
      debug: this.debug,
      scene: this.scene,
      time: this.time,
      sizes: this.sizes,
      controls: this.controls,
      sounds: this.sounds,
    })),
      this.container.add(this.physics.models.container));
  }
  setZones() {
    ((this.zones = new Zones({ time: this.time, physics: this.physics, debug: this.debugFolder })),
      this.container.add(this.zones.container));
  }
  setAreas() {
    ((this.areas = new Areas({
      config: this.config,
      resources: this.resources,
      debug: this.debug,
      renderer: this.renderer,
      camera: this.camera,
      car: this.car,
      sounds: this.sounds,
      time: this.time,
    })),
      this.container.add(this.areas.container));
  }
  setTiles() {
    this.tiles = new Tiles({ resources: this.resources, objects: this.objects, debug: this.debug });
  }
  setWalls() {
    this.walls = new Walls({ resources: this.resources, objects: this.objects });
  }
  setObjects() {
    ((this.objects = new Objects({
      time: this.time,
      resources: this.resources,
      materials: this.materials,
      physics: this.physics,
      shadows: this.shadows,
      sounds: this.sounds,
      debug: this.debugFolder,
    })),
      this.container.add(this.objects.container));
  }
  setCar() {
    ((this.car = new Car({
      time: this.time,
      resources: this.resources,
      objects: this.objects,
      physics: this.physics,
      shadows: this.shadows,
      materials: this.materials,
      controls: this.controls,
      sounds: this.sounds,
      renderer: this.renderer,
      camera: this.camera,
      debug: this.debugFolder,
      config: this.config,
    })),
      this.container.add(this.car.container));
  }
  setSections() {
    this.sections = {};
    const e = {
      config: this.config,
      time: this.time,
      resources: this.resources,
      camera: this.camera,
      passes: this.passes,
      objects: this.objects,
      areas: this.areas,
      zones: this.zones,
      walls: this.walls,
      tiles: this.tiles,
      debug: this.debugFolder,
    };
    ((this.sections.intro = new IntroSection({ ...e, x: 0, y: 0 })),
      this.container.add(this.sections.intro.container),
      (this.sections.crossroads = new CrossroadsSection({ ...e, x: 0, y: -30 })),
      this.container.add(this.sections.crossroads.container),
      (this.sections.projects = new ProjectsSection({ ...e, x: 30, y: -30 })),
      this.container.add(this.sections.projects.container),
      (this.sections.information = new InformationSection({ ...e, x: 1.2, y: -55 })),
      this.container.add(this.sections.information.container),
      (this.sections.playground = new PlaygroundSection({ ...e, x: -38, y: -34 })),
      this.container.add(this.sections.playground.container));
  }
  setEasterEggs() {
    ((this.easterEggs = new EasterEggs({
      resources: this.resources,
      car: this.car,
      walls: this.walls,
      objects: this.objects,
      materials: this.materials,
      areas: this.areas,
      config: this.config,
      physics: this.physics,
    })),
      this.container.add(this.easterEggs.container));
  }
}
let Loader = class extends EventEmitter {
  constructor() {
    (super(), this.setLoaders(), (this.toLoad = 0), (this.loaded = 0), (this.items = {}));
  }
  setLoaders() {
    ((this.loaders = []),
      this.loaders.push({
        extensions: ["jpg", "png", "webp"],
        action: (i) => {
          const s = new Image();
          (s.addEventListener("load", () => {
            this.fileLoadEnd(i, s);
          }),
            s.addEventListener("error", () => {
              this.fileLoadEnd(i, s);
            }),
            (s.src = /\/models\/projects\/[^/]+\/floorTexture\.(?:png|webp|jpe?g)(?:[?#]|$)/i.test(
              i.source,
            )
              ? "./models/matcaps/black.png"
              : i.source));
        },
      }));
    const e = new DRACOLoader();
    this.loaders.push({
      extensions: ["drc"],
      action: (i) => {
        e.load(i.source, (s) => {
          this.fileLoadEnd(i, s);
        });
      },
    });
    const t = new GLTFLoader();
    (t.setDRACOLoader(e),
      this.loaders.push({
        extensions: ["glb", "gltf"],
        action: (i) => {
          t.load(i.source, (s) => {
            this.fileLoadEnd(i, s);
          });
        },
      }));
    const n = new FBXLoader();
    this.loaders.push({
      extensions: ["fbx"],
      action: (i) => {
        n.load(i.source, (s) => {
          this.fileLoadEnd(i, s);
        });
      },
    });
  }
  load(e = []) {
    for (const t of e) {
      this.toLoad++;
      const n = t.source.match(/\.([a-z]+)$/);
      if (typeof n[1] < "u") {
        const i = n[1],
          s = this.loaders.find((r) => r.extensions.find((a) => a === i));
        s ? s.action(t) : console.warn(`Cannot found loader for ${t}`);
      } else console.warn(`Cannot found extension of ${t}`);
    }
  }
  fileLoadEnd(e, t) {
    (this.loaded++,
      (this.items[e.name] = t),
      this.trigger("fileEnd", [e, t]),
      this.loaded === this.toLoad && this.trigger("end"));
  }
};
class Resources extends EventEmitter {
  constructor() {
    (super(),
      (this.loader = new Loader()),
      (this.items = {}),
      this.loader.load([
        { name: "matcapBeige", source: "./models/matcaps/beige.png", type: "texture" },
        { name: "matcapBlack", source: "./models/matcaps/black.png", type: "texture" },
        { name: "matcapOrange", source: "./models/matcaps/orange.png", type: "texture" },
        { name: "matcapRed", source: "./models/matcaps/red.png", type: "texture" },
        { name: "matcapWhite", source: "./models/matcaps/white.png", type: "texture" },
        { name: "matcapGreen", source: "./models/matcaps/green.png", type: "texture" },
        { name: "matcapBrown", source: "./models/matcaps/brown.png", type: "texture" },
        { name: "matcapGray", source: "./models/matcaps/gray.png", type: "texture" },
        {
          name: "matcapEmeraldGreen",
          source: "./models/matcaps/emeraldGreen.png",
          type: "texture",
        },
        { name: "matcapPurple", source: "./models/matcaps/purple.png", type: "texture" },
        { name: "matcapBlue", source: "./models/matcaps/blue.png", type: "texture" },
        { name: "matcapYellow", source: "./models/matcaps/yellow.png", type: "texture" },
        { name: "matcapMetal", source: "./models/matcaps/metal.png", type: "texture" },
        { name: "introStaticBase", source: "./models/intro/static/base.glb" },
        { name: "introStaticCollision", source: "./models/intro/static/collision.glb" },
        {
          name: "introStaticFloorShadow",
          source: "./models/intro/static/floorShadow.png",
          type: "texture",
        },
        { name: "introInstructionsLabels", source: "./models/intro/instructions/labels.glb" },
        {
          name: "introInstructionsArrows",
          source: "./models/intro/instructions/arrows.png",
          type: "texture",
        },
        {
          name: "introInstructionsControls",
          source: "./models/intro/instructions/controls.png",
          type: "texture",
        },
        {
          name: "introInstructionsOther",
          source: "./models/intro/instructions/other.png",
          type: "texture",
        },
        { name: "introArrowKeyBase", source: "./models/intro/arrowKey/base.glb" },
        { name: "introArrowKeyCollision", source: "./models/intro/arrowKey/collision.glb" },
        { name: "introBBase", source: "./models/intro/b/base.glb" },
        { name: "introBCollision", source: "./models/intro/b/collision.glb" },
        { name: "introRBase", source: "./models/intro/r/base.glb" },
        { name: "introRCollision", source: "./models/intro/r/collision.glb" },
        { name: "introUBase", source: "./models/intro/u/base.glb" },
        { name: "introUCollision", source: "./models/intro/u/collision.glb" },
        { name: "introNBase", source: "./models/intro/n/base.glb" },
        { name: "introNCollision", source: "./models/intro/n/collision.glb" },
        { name: "introOBase", source: "./models/intro/o/base.glb" },
        { name: "introOCollision", source: "./models/intro/o/collision.glb" },
        { name: "introSBase", source: "./models/intro/s/base.glb" },
        { name: "introSCollision", source: "./models/intro/s/collision.glb" },
        { name: "introIBase", source: "./models/intro/i/base.glb" },
        { name: "introICollision", source: "./models/intro/i/collision.glb" },
        { name: "introMBase", source: "./models/intro/m/base.glb" },
        { name: "introMCollision", source: "./models/intro/m/collision.glb" },
        { name: "introCreativeBase", source: "./models/intro/creative/base.glb" },
        { name: "introCreativeCollision", source: "./models/intro/creative/collision.glb" },
        { name: "introDevBase", source: "./models/intro/dev/base.glb" },
        { name: "introDevCollision", source: "./models/intro/dev/collision.glb" },
        { name: "crossroadsStaticBase", source: "./models/crossroads/static/base.glb" },
        { name: "crossroadsStaticCollision", source: "./models/crossroads/static/collision.glb" },
        {
          name: "crossroadsStaticFloorShadow",
          source: "./models/crossroads/static/floorShadow.png",
          type: "texture",
        },
        { name: "carDefaultChassis", source: "./models/car/default/chassis.glb" },
        { name: "carDefaultWheel", source: "./models/car/default/wheel.glb" },
        { name: "carDefaultBackLightsBrake", source: "./models/car/default/backLightsBrake.glb" },
        {
          name: "carDefaultBackLightsReverse",
          source: "./models/car/default/backLightsReverse.glb",
        },
        { name: "carDefaultAntena", source: "./models/car/default/antena.glb" },
        { name: "carCyberTruckChassis", source: "./models/car/cyberTruck/chassis.glb" },
        { name: "carCyberTruckWheel", source: "./models/car/cyberTruck/wheel.glb" },
        {
          name: "carCyberTruckBackLightsBrake",
          source: "./models/car/cyberTruck/backLightsBrake.glb",
        },
        {
          name: "carCyberTruckBackLightsReverse",
          source: "./models/car/cyberTruck/backLightsReverse.glb",
        },
        { name: "carCyberTruckAntena", source: "./models/car/cyberTruck/antena.glb" },
        { name: "projectsBoardStructure", source: "./models/projects/board/structure.glb" },
        { name: "projectsBoardCollision", source: "./models/projects/board/collision.glb" },
        {
          name: "projectsBoardStructureFloorShadow",
          source: "./models/projects/board/floorShadow.png",
          type: "texture",
        },
        { name: "projectsBoardPlane", source: "./models/projects/board/plane.glb" },
        {
          name: "projectsDistinctionsAwwwardsBase",
          source: "./models/projects/distinctions/awwwards/base.glb",
        },
        {
          name: "projectsDistinctionsAwwwardsCollision",
          source: "./models/projects/distinctions/awwwards/collision.glb",
        },
        {
          name: "projectsDistinctionsFWABase",
          source: "./models/projects/distinctions/fwa/base.glb",
        },
        {
          name: "projectsDistinctionsFWACollision",
          source: "./models/projects/distinctions/fwa/collision.glb",
        },
        {
          name: "projectsDistinctionsCSSDABase",
          source: "./models/projects/distinctions/cssda/base.glb",
        },
        {
          name: "projectsDistinctionsCSSDACollision",
          source: "./models/projects/distinctions/cssda/collision.glb",
        },
        {
          name: "projectsLuniFloor",
          source: "./models/projects/luni/floorTexture.webp",
          type: "texture",
        },
        {
          name: "projectsBonhomme10ansFloor",
          source: "./models/projects/bonhomme10ans/floorTexture.webp",
          type: "texture",
        },
        {
          name: "projectsThreejsJourneyFloor",
          source: "./models/projects/threejsJourney/floorTexture.webp",
          type: "texture",
        },
        {
          name: "projectsMadboxFloor",
          source: "./models/projects/madbox/floorTexture.png",
          type: "texture",
        },
        {
          name: "projectsScoutFloor",
          source: "./models/projects/scout/floorTexture.png",
          type: "texture",
        },
        {
          name: "projectsChartogneFloor",
          source: "./models/projects/chartogne/floorTexture.png",
          type: "texture",
        },
        {
          name: "projectsCitrixRedbullFloor",
          source: "./models/projects/citrixRedbull/floorTexture.png",
          type: "texture",
        },
        {
          name: "projectsPriorHoldingsFloor",
          source: "./models/projects/priorHoldings/floorTexture.png",
          type: "texture",
        },
        {
          name: "projectsOranoFloor",
          source: "./models/projects/orano/floorTexture.png",
          type: "texture",
        },
        { name: "informationStaticBase", source: "./models/information/static/base.glb" },
        { name: "informationStaticCollision", source: "./models/information/static/collision.glb" },
        {
          name: "informationStaticFloorShadow",
          source: "./models/information/static/floorShadow.png",
          type: "texture",
        },
        { name: "informationBaguetteBase", source: "./models/information/baguette/base.glb" },
        {
          name: "informationBaguetteCollision",
          source: "./models/information/baguette/collision.glb",
        },
        {
          name: "informationContactTwitterLabel",
          source: "./models/information/static/contactTwitterLabel.png",
          type: "texture",
        },
        {
          name: "informationContactGithubLabel",
          source: "./models/information/static/contactGithubLabel.png",
          type: "texture",
        },
        {
          name: "informationContactLinkedinLabel",
          source: "./models/information/static/contactLinkedinLabel.png",
          type: "texture",
        },
        {
          name: "informationContactMailLabel",
          source: "./models/information/static/contactMailLabel.png",
          type: "texture",
        },
        {
          name: "informationActivities",
          source: "./models/information/static/activities.png",
          type: "texture",
        },
        { name: "playgroundStaticBase", source: "./models/playground/static/base.glb" },
        { name: "playgroundStaticCollision", source: "./models/playground/static/collision.glb" },
        {
          name: "playgroundStaticFloorShadow",
          source: "./models/playground/static/floorShadow.png",
          type: "texture",
        },
        { name: "brickBase", source: "./models/brick/base.glb" },
        { name: "brickCollision", source: "./models/brick/collision.glb" },
        { name: "hornBase", source: "./models/horn/base.glb" },
        { name: "hornCollision", source: "./models/horn/collision.glb" },
        { name: "webbyTrophyBase", source: "./models/webbyTrophy/base.glb" },
        { name: "webbyTrophyCollision", source: "./models/webbyTrophy/collision.glb" },
        { name: "lemonBase", source: "./models/lemon/base.glb" },
        { name: "lemonCollision", source: "./models/lemon/collision.glb" },
        { name: "bowlingBallBase", source: "./models/bowlingBall/base.glb" },
        { name: "bowlingBallCollision", source: "./models/bowlingBall/collision.glb" },
        { name: "bowlingPinBase", source: "./models/bowlingPin/base.glb" },
        { name: "bowlingPinCollision", source: "./models/bowlingPin/collision.glb" },
        { name: "areaKeyEnter", source: "./models/area/keyEnter.png", type: "texture" },
        { name: "areaEnter", source: "./models/area/enter.png", type: "texture" },
        { name: "areaOpen", source: "./models/area/open.png", type: "texture" },
        { name: "areaReset", source: "./models/area/reset.png", type: "texture" },
        { name: "areaQuestionMark", source: "./models/area/questionMark.png", type: "texture" },
        { name: "tilesABase", source: "./models/tiles/a/base.glb" },
        { name: "tilesACollision", source: "./models/tiles/a/collision.glb" },
        { name: "tilesBBase", source: "./models/tiles/b/base.glb" },
        { name: "tilesBCollision", source: "./models/tiles/b/collision.glb" },
        { name: "tilesCBase", source: "./models/tiles/c/base.glb" },
        { name: "tilesCCollision", source: "./models/tiles/c/collision.glb" },
        { name: "tilesDBase", source: "./models/tiles/d/base.glb" },
        { name: "tilesDCollision", source: "./models/tiles/d/collision.glb" },
        { name: "tilesEBase", source: "./models/tiles/e/base.glb" },
        { name: "tilesECollision", source: "./models/tiles/e/collision.glb" },
        { name: "konamiLabel", source: "./models/konami/label.png", type: "texture" },
        { name: "konamiLabelTouch", source: "./models/konami/label-touch.png", type: "texture" },
        { name: "wig1", source: "./models/wigs/wig1.glb" },
        { name: "wig2", source: "./models/wigs/wig2.glb" },
        { name: "wig3", source: "./models/wigs/wig3.glb" },
        { name: "wig4", source: "./models/wigs/wig4.glb" },
      ]),
      this.loader.on("fileEnd", (e, t) => {
        if (((this.items[e.name] = t), e.type === "texture")) {
          const n = new Texture(t);
          ((n.needsUpdate = !0), (this.items[`${e.name}Texture`] = n));
        }
        this.trigger("progress", [this.loader.loaded / this.loader.toLoad]);
      }),
      this.loader.on("end", () => {
        this.trigger("ready");
      }));
  }
}
class Camera {
  constructor(e) {
    ((this.time = e.time),
      (this.sizes = e.sizes),
      (this.renderer = e.renderer),
      (this.debug = e.debug),
      (this.config = e.config),
      (this.container = new Object3D()),
      (this.container.matrixAutoUpdate = !1),
      (this.target = new Vector3(0, 0, 0)),
      (this.targetEased = new Vector3(0, 0, 0)),
      (this.easing = 0.15),
      this.debug && (this.debugFolder = this.debug.addFolder("camera")),
      this.setAngle(),
      this.setInstance(),
      this.setZoom(),
      this.setPan(),
      this.setOrbitControls());
  }
  setAngle() {
    ((this.angle = {}),
      (this.angle.items = {
        default: new Vector3(1.135, -1.45, 1.15),
        projects: new Vector3(0.38, -1.4, 1.63),
      }),
      (this.angle.value = new Vector3()),
      this.angle.value.copy(this.angle.items.default),
      (this.angle.set = (e) => {
        const t = this.angle.items[e];
        typeof t < "u" && gsap.to(this.angle.value, { ...t, duration: 2, ease: "power1.inOut" });
      }),
      this.debug &&
        (this.debugFolder.add(this, "easing").step(1e-4).min(0).max(1).name("easing"),
        this.debugFolder
          .add(this.angle.value, "x")
          .step(0.001)
          .min(-2)
          .max(2)
          .name("invertDirectionX")
          .listen(),
        this.debugFolder
          .add(this.angle.value, "y")
          .step(0.001)
          .min(-2)
          .max(2)
          .name("invertDirectionY")
          .listen(),
        this.debugFolder
          .add(this.angle.value, "z")
          .step(0.001)
          .min(-2)
          .max(2)
          .name("invertDirectionZ")
          .listen()));
  }
  setInstance() {
    ((this.instance = new PerspectiveCamera(
      40,
      this.sizes.viewport.width / this.sizes.viewport.height,
      1,
      80,
    )),
      this.instance.up.set(0, 0, 1),
      this.instance.position.copy(this.angle.value),
      this.instance.lookAt(new Vector3()),
      this.container.add(this.instance),
      this.sizes.on("resize", () => {
        ((this.instance.aspect = this.sizes.viewport.width / this.sizes.viewport.height),
          this.instance.updateProjectionMatrix());
      }),
      this.time.on("tick", () => {
        this.orbitControls.enabled ||
          ((this.targetEased.x += (this.target.x - this.targetEased.x) * this.easing),
          (this.targetEased.y += (this.target.y - this.targetEased.y) * this.easing),
          (this.targetEased.z += (this.target.z - this.targetEased.z) * this.easing),
          this.instance.position
            .copy(this.targetEased)
            .add(this.angle.value.clone().normalize().multiplyScalar(this.zoom.distance)),
          this.instance.lookAt(this.targetEased),
          (this.instance.position.x += this.pan.value.x),
          (this.instance.position.y += this.pan.value.y));
      }));
  }
  setZoom() {
    ((this.zoom = {}),
      (this.zoom.easing = 0.1),
      (this.zoom.minDistance = 14),
      (this.zoom.amplitude = 15),
      (this.zoom.value = this.config.cyberTruck ? 0.3 : 0.5),
      (this.zoom.targetValue = this.zoom.value),
      (this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value),
      document.addEventListener(
        "mousewheel",
        (e) => {
          ((this.zoom.targetValue += e.deltaY * 0.001),
            (this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1)));
        },
        { passive: !0 },
      ),
      (this.zoom.touch = {}),
      (this.zoom.touch.startDistance = 0),
      (this.zoom.touch.startValue = 0),
      this.renderer.domElement.addEventListener("touchstart", (e) => {
        e.touches.length === 2 &&
          ((this.zoom.touch.startDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientX - e.touches[1].clientX,
          )),
          (this.zoom.touch.startValue = this.zoom.targetValue));
      }),
      this.renderer.domElement.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const n =
            Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientX - e.touches[1].clientX,
            ) / this.zoom.touch.startDistance;
          ((this.zoom.targetValue = this.zoom.touch.startValue - (n - 1)),
            (this.zoom.targetValue = Math.min(Math.max(this.zoom.targetValue, 0), 1)));
        }
      }),
      this.time.on("tick", () => {
        ((this.zoom.value += (this.zoom.targetValue - this.zoom.value) * this.zoom.easing),
          (this.zoom.distance = this.zoom.minDistance + this.zoom.amplitude * this.zoom.value));
      }));
  }
  setPan() {
    ((this.pan = {}),
      (this.pan.enabled = !1),
      (this.pan.active = !1),
      (this.pan.easing = 0.1),
      (this.pan.start = {}),
      (this.pan.start.x = 0),
      (this.pan.start.y = 0),
      (this.pan.value = {}),
      (this.pan.value.x = 0),
      (this.pan.value.y = 0),
      (this.pan.targetValue = {}),
      (this.pan.targetValue.x = this.pan.value.x),
      (this.pan.targetValue.y = this.pan.value.y),
      (this.pan.raycaster = new Raycaster()),
      (this.pan.mouse = new Vector2()),
      (this.pan.needsUpdate = !1),
      (this.pan.hitMesh = new Mesh(
        new PlaneGeometry(500, 500, 1, 1),
        new MeshBasicMaterial({ color: 16711680, wireframe: !0, visible: !1 }),
      )),
      this.container.add(this.pan.hitMesh),
      (this.pan.reset = () => {
        ((this.pan.targetValue.x = 0), (this.pan.targetValue.y = 0));
      }),
      (this.pan.enable = () => {
        ((this.pan.enabled = !0), this.renderer.domElement.classList.add("has-cursor-grab"));
      }),
      (this.pan.disable = () => {
        ((this.pan.enabled = !1), this.renderer.domElement.classList.remove("has-cursor-grab"));
      }),
      (this.pan.down = (e, t) => {
        if (!this.pan.enabled) return;
        (this.renderer.domElement.classList.add("has-cursor-grabbing"),
          (this.pan.active = !0),
          (this.pan.mouse.x = (e / this.sizes.viewport.width) * 2 - 1),
          (this.pan.mouse.y = -(t / this.sizes.viewport.height) * 2 + 1),
          this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance));
        const n = this.pan.raycaster.intersectObjects([this.pan.hitMesh]);
        n.length && ((this.pan.start.x = n[0].point.x), (this.pan.start.y = n[0].point.y));
      }),
      (this.pan.move = (e, t) => {
        this.pan.enabled &&
          this.pan.active &&
          ((this.pan.mouse.x = (e / this.sizes.viewport.width) * 2 - 1),
          (this.pan.mouse.y = -(t / this.sizes.viewport.height) * 2 + 1),
          (this.pan.needsUpdate = !0));
      }),
      (this.pan.up = () => {
        ((this.pan.active = !1), this.renderer.domElement.classList.remove("has-cursor-grabbing"));
      }),
      window.addEventListener("mousedown", (e) => {
        this.pan.down(e.clientX, e.clientY);
      }),
      window.addEventListener("mousemove", (e) => {
        this.pan.move(e.clientX, e.clientY);
      }),
      window.addEventListener("mouseup", () => {
        this.pan.up();
      }),
      this.renderer.domElement.addEventListener("touchstart", (e) => {
        e.touches.length === 1 && this.pan.down(e.touches[0].clientX, e.touches[0].clientY);
      }),
      this.renderer.domElement.addEventListener("touchmove", (e) => {
        e.touches.length === 1 && this.pan.move(e.touches[0].clientX, e.touches[0].clientY);
      }),
      this.renderer.domElement.addEventListener("touchend", () => {
        this.pan.up();
      }),
      this.time.on("tick", () => {
        if (this.pan.active && this.pan.needsUpdate) {
          this.pan.raycaster.setFromCamera(this.pan.mouse, this.instance);
          const e = this.pan.raycaster.intersectObjects([this.pan.hitMesh]);
          (e.length &&
            ((this.pan.targetValue.x = -(e[0].point.x - this.pan.start.x)),
            (this.pan.targetValue.y = -(e[0].point.y - this.pan.start.y))),
            (this.pan.needsUpdate = !1));
        }
        ((this.pan.value.x += (this.pan.targetValue.x - this.pan.value.x) * this.pan.easing),
          (this.pan.value.y += (this.pan.targetValue.y - this.pan.value.y) * this.pan.easing));
      }));
  }
  setOrbitControls() {
    ((this.orbitControls = new OrbitControls(this.instance, this.renderer.domElement)),
      (this.orbitControls.enabled = !1),
      (this.orbitControls.enableKeys = !1),
      (this.orbitControls.zoomSpeed = 0.5),
      this.debug &&
        this.debugFolder.add(this.orbitControls, "enabled").name("orbitControlsEnabled"));
  }
}
class ThreejsJourney {
  constructor(e) {
    ((this.config = e.config),
      (this.time = e.time),
      (this.world = e.world),
      (this.$container = document.querySelector(".js-threejs-journey")),
      (this.$messages = [...this.$container.querySelectorAll(".js-message")]),
      (this.$yes = this.$container.querySelector(".js-yes")),
      (this.$no = this.$container.querySelector(".js-no")),
      (this.step = 0),
      (this.maxStep = this.$messages.length - 1),
      (this.seenCount = window.localStorage.getItem("threejsJourneySeenCount") || 0),
      (this.seenCount = parseInt(this.seenCount)),
      (this.shown = !1),
      (this.traveledDistance = 0),
      (this.minTraveledDistance = (this.config.debug ? 5 : 75) * (this.seenCount + 1)),
      (this.prevent = !!window.localStorage.getItem("threejsJourneyPrevent")),
      this.config.debug && this.start(),
      !this.prevent &&
        (this.setYesNo(),
        this.setLog(),
        this.time.on("tick", () => {
          this.world.physics &&
            ((this.traveledDistance += this.world.physics.car.forwardSpeed),
            !this.config.touch &&
              !this.shown &&
              this.traveledDistance > this.minTraveledDistance &&
              this.start());
        })));
  }
  setYesNo() {
    (this.$yes.addEventListener("click", () => {
      (gsap.delayedCall(2, () => {
        this.hide();
      }),
        window.localStorage.setItem("threejsJourneyPrevent", 1));
    }),
      this.$no.addEventListener("click", () => {
        (this.next(),
          gsap.delayedCall(5, () => {
            this.hide();
          }));
      }),
      this.$yes.addEventListener("mouseenter", () => {
        (this.$container.classList.remove("is-hover-none"),
          this.$container.classList.remove("is-hover-no"),
          this.$container.classList.add("is-hover-yes"));
      }),
      this.$no.addEventListener("mouseenter", () => {
        (this.$container.classList.remove("is-hover-none"),
          this.$container.classList.add("is-hover-no"),
          this.$container.classList.remove("is-hover-yes"));
      }),
      this.$yes.addEventListener("mouseleave", () => {
        (this.$container.classList.add("is-hover-none"),
          this.$container.classList.remove("is-hover-no"),
          this.$container.classList.remove("is-hover-yes"));
      }),
      this.$no.addEventListener("mouseleave", () => {
        (this.$container.classList.add("is-hover-none"),
          this.$container.classList.remove("is-hover-no"),
          this.$container.classList.remove("is-hover-yes"));
      }));
  }
  setLog() {
    console.log(
      "%cGitSkins Folio is ready. Drive around and explore the profile.",
      "color: #32ffce",
    );
  }
  hide() {
    for (const e of this.$messages) e.classList.remove("is-visible");
    gsap.delayedCall(0.5, () => {
      this.$container.classList.remove("is-active");
    });
  }
  start() {
    (this.$container.classList.add("is-active"),
      window.requestAnimationFrame(() => {
        (this.next(),
          gsap.delayedCall(4, () => {
            this.next();
          }),
          gsap.delayedCall(7, () => {
            this.next();
          }));
      }),
      (this.shown = !0),
      window.localStorage.setItem("threejsJourneySeenCount", this.seenCount + 1));
  }
  updateMessages() {
    let e = 0;
    for (const n of this.$messages) (e < this.step && n.classList.add("is-visible"), e++);
    this.$messages.reverse();
    let t = 0;
    e = this.maxStep;
    for (const n of this.$messages) {
      const i = n.offsetHeight;
      (e < this.step
        ? ((n.style.transform = `translateY(${-t}px)`), (t += i + 20))
        : (n.style.transform = `translateY(${i}px)`),
        e--);
    }
    this.$messages.reverse();
  }
  next() {
    this.step > this.maxStep || (this.step++, this.updateMessages());
  }
}
const eT = {
  name: "CopyShader",
  uniforms: { tDiffuse: { value: null }, opacity: { value: 1 } },
  vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
  fragmentShader: `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`,
};
var blurFragment = `#define M_PI 3.1415926535897932384626433832795

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform vec2 uStrength;

varying vec2 vUv;

vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}

void main()
{
    vec4 diffuseColor = texture2D(tDiffuse, vUv);
    vec4 blurColor = blur9(tDiffuse, vUv, uResolution, uStrength);
    float blurStrength = 1.0 - sin(vUv.y * M_PI);
    gl_FragColor = mix(diffuseColor, blurColor, blurStrength);
}`,
  blurVertex = `varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const BlurPass = {
  uniforms: {
    tDiffuse: { type: "t", value: null },
    uResolution: { type: "v2", value: null },
    uStrength: { type: "v2", value: null },
  },
  vertexShader: blurVertex,
  fragmentShader: blurFragment,
};
var glowFragment = `uniform sampler2D tDiffuse;
uniform vec2 uPosition;
uniform float uRadius;
uniform vec3 uColor;
uniform float uAlpha;

varying vec2 vUv;

void main()
{
    vec4 diffuseColor = texture2D(tDiffuse, vUv);

    float glowStrength = distance(vUv, uPosition) / uRadius;
    glowStrength = 1.0 - glowStrength;
    glowStrength *= uAlpha;
    glowStrength = clamp(glowStrength, 0.0, 1.0);
    vec3 color = mix(diffuseColor.rgb, uColor, glowStrength);

    gl_FragColor = vec4(color, 1.0);
}`,
  glowVertex = `varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const GlowsPass = {
  uniforms: {
    tDiffuse: { type: "t", value: null },
    uPosition: { type: "v2", value: null },
    uRadius: { type: "f", value: null },
    uColor: { type: "v3", value: null },
    uAlpha: { type: "f", value: null },
  },
  vertexShader: glowVertex,
  fragmentShader: glowFragment,
};
class Application {
  constructor(e) {
    ((this.$canvas = e.$canvas),
      (this.time = new Time()),
      (this.sizes = new Sizes()),
      (this.resources = new Resources()),
      this.setConfig(),
      this.setDebug(),
      this.setRenderer(),
      this.setCamera(),
      this.setPasses(),
      this.setWorld(),
      this.setTitle(),
      this.setThreejsJourney());
  }
  setConfig() {
    ((this.config = {}),
      (this.config.debug = window.location.hash === "#debug"),
      (this.config.cyberTruck = window.location.hash === "#cybertruck"),
      (this.config.touch = !1),
      window.addEventListener(
        "touchstart",
        () => {
          ((this.config.touch = !0),
            this.world.controls.setTouch(),
            (this.passes.horizontalBlurPass.strength = 1),
            (this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new Vector2(
              this.passes.horizontalBlurPass.strength,
              0,
            )),
            (this.passes.verticalBlurPass.strength = 1),
            (this.passes.verticalBlurPass.material.uniforms.uStrength.value = new Vector2(
              0,
              this.passes.verticalBlurPass.strength,
            )));
        },
        { once: !0 },
      ));
  }
  setDebug() {
    this.config.debug && (this.debug = new GUI({ width: 420 }));
  }
  setRenderer() {
    ((this.scene = new Scene()),
      (this.renderer = new WebGLRenderer({
        canvas: this.$canvas,
        alpha: !0,
        powerPreference: "high-performance",
      })),
      this.renderer.setClearColor(0, 1),
      this.renderer.setPixelRatio(2),
      this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height),
      (this.renderer.autoClear = !1),
      this.sizes.on("resize", () => {
        this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height);
      }));
  }
  setCamera() {
    ((this.camera = new Camera({
      time: this.time,
      sizes: this.sizes,
      renderer: this.renderer,
      debug: this.debug,
      config: this.config,
    })),
      this.scene.add(this.camera.container),
      this.time.on("tick", () => {
        this.world &&
          this.world.car &&
          ((this.camera.target.x = this.world.car.chassis.object.position.x),
          (this.camera.target.y = this.world.car.chassis.object.position.y));
      }));
  }
  setPasses() {
    if (
      ((this.passes = {}),
      this.debug && (this.passes.debugFolder = this.debug.addFolder("postprocess")),
      (this.passes.composer = new EffectComposer(this.renderer)),
      (this.passes.renderPass = new RenderPass(this.scene, this.camera.instance)),
      (this.passes.horizontalBlurPass = new ShaderPass(BlurPass)),
      (this.passes.horizontalBlurPass.strength = this.config.touch ? 0 : 1),
      (this.passes.horizontalBlurPass.material.uniforms.uResolution.value = new Vector2(
        this.sizes.viewport.width,
        this.sizes.viewport.height,
      )),
      (this.passes.horizontalBlurPass.material.uniforms.uStrength.value = new Vector2(
        this.passes.horizontalBlurPass.strength,
        0,
      )),
      (this.passes.verticalBlurPass = new ShaderPass(BlurPass)),
      (this.passes.verticalBlurPass.strength = this.config.touch ? 0 : 1),
      (this.passes.verticalBlurPass.material.uniforms.uResolution.value = new Vector2(
        this.sizes.viewport.width,
        this.sizes.viewport.height,
      )),
      (this.passes.verticalBlurPass.material.uniforms.uStrength.value = new Vector2(
        0,
        this.passes.verticalBlurPass.strength,
      )),
      this.debug)
    ) {
      const e = this.passes.debugFolder.addFolder("blur");
      (e.open(),
        e
          .add(this.passes.horizontalBlurPass.material.uniforms.uStrength.value, "x")
          .step(0.001)
          .min(0)
          .max(10),
        e
          .add(this.passes.verticalBlurPass.material.uniforms.uStrength.value, "y")
          .step(0.001)
          .min(0)
          .max(10));
    }
    if (
      ((this.passes.glowsPass = new ShaderPass(GlowsPass)),
      (this.passes.glowsPass.color = "#ffcfe0"),
      (this.passes.glowsPass.material.uniforms.uPosition.value = new Vector2(0, 0.25)),
      (this.passes.glowsPass.material.uniforms.uRadius.value = 0.7),
      (this.passes.glowsPass.material.uniforms.uColor.value = new Color(
        this.passes.glowsPass.color,
      )),
      this.passes.glowsPass.material.uniforms.uColor.value.convertLinearToSRGB(),
      (this.passes.glowsPass.material.uniforms.uAlpha.value = 0.55),
      this.debug)
    ) {
      const e = this.passes.debugFolder.addFolder("glows");
      (e.open(),
        e
          .add(this.passes.glowsPass.material.uniforms.uPosition.value, "x")
          .step(0.001)
          .min(-1)
          .max(2)
          .name("positionX"),
        e
          .add(this.passes.glowsPass.material.uniforms.uPosition.value, "y")
          .step(0.001)
          .min(-1)
          .max(2)
          .name("positionY"),
        e
          .add(this.passes.glowsPass.material.uniforms.uRadius, "value")
          .step(0.001)
          .min(0)
          .max(2)
          .name("radius"),
        e
          .addColor(this.passes.glowsPass, "color")
          .name("color")
          .onChange(() => {
            this.passes.glowsPass.material.uniforms.uColor.value = new Color(
              this.passes.glowsPass.color,
            );
          }),
        e
          .add(this.passes.glowsPass.material.uniforms.uAlpha, "value")
          .step(0.001)
          .min(0)
          .max(1)
          .name("alpha"));
    }
    (this.passes.composer.addPass(this.passes.renderPass),
      this.passes.composer.addPass(this.passes.horizontalBlurPass),
      this.passes.composer.addPass(this.passes.verticalBlurPass),
      this.passes.composer.addPass(this.passes.glowsPass),
      this.time.on("tick", () => {
        ((this.passes.horizontalBlurPass.enabled =
          this.passes.horizontalBlurPass.material.uniforms.uStrength.value.x > 0),
          (this.passes.verticalBlurPass.enabled =
            this.passes.verticalBlurPass.material.uniforms.uStrength.value.y > 0),
          this.passes.composer.render());
      }),
      this.sizes.on("resize", () => {
        (this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height),
          this.passes.composer.setSize(this.sizes.viewport.width, this.sizes.viewport.height),
          (this.passes.horizontalBlurPass.material.uniforms.uResolution.value.x =
            this.sizes.viewport.width),
          (this.passes.horizontalBlurPass.material.uniforms.uResolution.value.y =
            this.sizes.viewport.height),
          (this.passes.verticalBlurPass.material.uniforms.uResolution.value.x =
            this.sizes.viewport.width),
          (this.passes.verticalBlurPass.material.uniforms.uResolution.value.y =
            this.sizes.viewport.height));
      }));
  }
  setWorld() {
    ((this.world = new World({
      config: this.config,
      debug: this.debug,
      resources: this.resources,
      time: this.time,
      sizes: this.sizes,
      camera: this.camera,
      scene: this.scene,
      renderer: this.renderer,
      passes: this.passes,
    })),
      this.scene.add(this.world.container));
  }
  setTitle() {
    ((this.title = {}),
      (this.title.frequency = 300),
      (this.title.width = 20),
      (this.title.position = 0),
      (this.title.$element = document.querySelector("title")),
      (this.title.absolutePosition = Math.round(this.title.width * 0.25)),
      this.time.on("tick", () => {
        this.world.physics &&
          ((this.title.absolutePosition += this.world.physics.car.forwardSpeed),
          this.title.absolutePosition < 0 && (this.title.absolutePosition = 0));
      }),
      window.setInterval(() => {
        ((this.title.position = Math.round(this.title.absolutePosition % this.title.width)),
          (document.title = `${"_".repeat(this.title.width - this.title.position)}🚗${"_".repeat(this.title.position)}`));
      }, this.title.frequency));
  }
  setThreejsJourney() {
    this.threejsJourney = new ThreejsJourney({
      config: this.config,
      time: this.time,
      world: this.world,
    });
  }
  destructor() {
    (this.time.off("tick"),
      this.sizes.off("resize"),
      this.camera.orbitControls.dispose(),
      this.renderer.dispose(),
      this.debug.destroy());
  }
}
const urlParams = new URLSearchParams(window.location.search);
const username = (urlParams.get("username") || window.gitskinsFolioData.username).replace(/^@/, "");
const goal = urlParams.get("goal") || "";
const tone = urlParams.get("tone") || "";
async function loadProfile() {
  const profile = window.gitskinsFolioData;
  if (!profile || !Array.isArray(profile.pinnedRepos))
    throw new Error("Saved portfolio profile is missing or invalid.");
  return {
    ...profile,
    username,
    gitskins: {
      ...profile.gitskins,
      goal: goal || profile.gitskins?.goal || "",
      tone: tone || profile.gitskins?.tone || "",
    },
  };
}
function setText(o, e) {
  const t = document.querySelector(o);
  t && e && (t.textContent = e);
}
function formatCount(o) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    o || 0,
  );
}
function goalLabel(o) {
  return (
    {
      "get-hired": "Open to meaningful work",
      "win-clients": "Available for collaborations",
      "promote-open-source": "Building in public",
      "showcase-products": "Shipping product work",
      "build-personal-brand": "Independent builder",
    }[o] || "Public GitHub profile"
  );
}
function toneLabel(o) {
  return (
    {
      premium: "Premium presentation",
      technical: "Technical focus",
      minimal: "Minimal signal",
      playful: "Playful energy",
      founder: "Founder perspective",
    }[o] || "Interactive portfolio"
  );
}
function setupProfileToggle() {
  const o = document.querySelector(".gitskins-profile-ui"),
    e = o == null ? void 0 : o.querySelector(".gitskins-profile-ui__toggle"),
    t = document.querySelector("#gitskins-profile-details");
  if (!o || !e || !t) return;
  const n = (i) => {
    (o.classList.toggle("is-expanded", i),
      o.classList.toggle("is-collapsed", !i),
      e.setAttribute("aria-expanded", String(i)),
      e.setAttribute("aria-label", i ? "Hide profile details" : "Show profile details"),
      (e.querySelector("span:first-child").textContent = i ? "Close" : "Details"),
      (e.querySelector("span:last-child").textContent = i ? "−" : "+"),
      (t.hidden = !i));
  };
  (e.addEventListener("click", () => {
    n(e.getAttribute("aria-expanded") !== "true");
  }),
    window.addEventListener("keydown", (i) => {
      i.key === "Escape" && e.getAttribute("aria-expanded") === "true" && n(!1);
    }));
}
async function startApplication() {
  var i, s;
  const o = await loadProfile();
  ((window.gitskinsFolioData = o), setupProfileToggle());
  const e = o.name || username;
  ((document.title = `${e} — GitSkins Folio`),
    setText("[data-profile-name]", e),
    setText("[data-profile-handle]", `@${username}`),
    setText("[data-profile-bio]", o.bio || "Building useful software in public."),
    setText("[data-profile-role]", o.company || "Independent builder"),
    setText("[data-profile-location]", o.location || "Public GitHub profile"),
    setText(
      "[data-profile-focus]",
      goalLabel(((i = o.gitskins) == null ? void 0 : i.goal) || goal),
    ),
    setText("[data-profile-tone]", toneLabel(((s = o.gitskins) == null ? void 0 : s.tone) || tone)),
    setText("[data-profile-contributions]", formatCount(o.totalContributions)),
    setText("[data-profile-repositories]", formatCount(o.totalRepos)),
    setText("[data-profile-stars]", formatCount(o.totalStars)),
    setText("[data-profile-followers]", formatCount(o.followers)));
  const t = document.querySelector("[data-profile-avatar]");
  t && o.avatarUrl && ((t.src = o.avatarUrl), (t.alt = `${e} GitHub avatar`));
  const n = document.querySelector("[data-profile-link]");
  (n && (n.href = `https://github.com/${encodeURIComponent(username)}`),
    (window.application = new Application({
      $canvas: document.querySelector(".js-canvas"),
      useComposer: !0,
    })));
}
startApplication();
