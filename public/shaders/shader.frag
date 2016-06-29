precision mediump float;

uniform vec3 CamPos;
uniform vec3 CamView;
uniform float ProjDist;

uniform int Width;
uniform int Height;

#include "rm-settings.frag"

#include "primitives.frag"
#include "operations.frag"

#include "models.frag"

uniform vec3 LightPos;

vec2 SDF( vec3 Point )
{
//  vec2 Prism = vec2(sdTexture(Point), 1.0);
  vec2 Prism = vec2(sdHexPrism(RotateX(Point, 90.0 / 180.0 * Pi), vec2(0.1, 0.2)), 1.0);
  vec2 Plane = vec2(sdPlane(Point, -0.1), 2.0);
  vec2 LightSource = vec2(sdSphere(Point - LightPos, 0.03), -1.0);

  return opU(opU(Prism, Plane), LightSource);
}

int GetMaterial( vec3 Point )
{
  return int(SDF(Point).y);
}

#include "ray-marching.frag"
#include "lighting.frag"

void main( void )
{
  vec3 V = GetPixelView(CamView, ProjDist, Width, Height);

  float Distance = Intersect(V).x;

  if (Distance > 0.0)
  {
    vec3 Position = Ray(CamPos, V, Distance);
///*Intersection test*/    gl_FragColor = vec4(0, 1, 1, 1);
///*Depth*/    gl_FragColor = vec4((1.0 - Distance / 2.0) * vec3(1.0, 1.0, 1.0), 1.0);
///*Normal*/    gl_FragColor = vec4(Normal(Position), 1.0);
/*Lighting*/    gl_FragColor = Lighting(Position);
  }
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); //Skybox(V);
}
