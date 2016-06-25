precision mediump float;

uniform vec3 CamPos;
uniform vec3 CamView;
uniform float ProjDist;

uniform int Width;
uniform int Height;

#include "rm-settings.frag"

#include "primitives.frag"
#include "operations.frag"

uniform vec3 LightPos;

vec2 SDF( vec3 Point )
{
  vec2 Prism = vec2(sdCylinder(RotateX(Point, 90.0 / 180.0 * Pi), vec2(0.1, 0.2)), 1.0);
  vec2 Plane = vec2(sdPlane(Point, -0.1), 2.0);
  vec2 LightSource = vec2(sdSphere(Point - LightPos, 0.03), -1.0);

  return opU(opU(Prism, Plane), LightSource);
}

#include "ray-marching.frag"
#include "shading.frag"

void main( void )
{
  vec3 CamViewProjDist;
  float XOff, YOff;
  vec3 V;
  float XScale = 1.0 * float(Width);
  float YScale = 1.0 * float(Height);

  if (Width > Height)
    YScale *= float(Width) / float(Height);
  else
    XScale *= float(Height) / float(Width);

  vec3 Up = vec3(0, 1, 0);
  vec3 Right = normalize(cross(CamView, Up));
  Up = normalize(cross(Right, CamView));

  XOff = gl_FragCoord.x / XScale * 2.0 - 1.0;
  YOff = gl_FragCoord.y / YScale * 2.0 - 1.0;

  CamViewProjDist = normalize(CamView) * ProjDist;

  V = normalize(CamViewProjDist + XOff * Right + YOff * Up);

  vec2 Inter = Intersect(V);

  if (abs(Inter.y) > 0.5)
  {
    vec3 point = Ray(CamPos, V, Inter.x);
    vec3 normal = Normal(point);
///*Depth*/    gl_FragColor = vec4((1.0 - Inter.x / 2.0) * vec3(1.0, 1.0, 1.0), 1.0);
///*Normal*/    gl_FragColor = vec4(normal, 1.0);
/*Lighting*/    gl_FragColor = vec4(Shade(point, V, normal, Inter.y), 1.0);
///*Material*/    gl_FragColor = vec4(vec3((Inter.y + 1.0) / 3.0), 1.0);
  }
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
