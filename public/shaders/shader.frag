#version 300 es

precision mediump float;
precision mediump sampler3D;

out vec4 Color;

uniform vec3 CamPos;
uniform vec3 CamView;
uniform float ProjDist;

uniform int Width;
uniform int Height;

#include "rm-settings.frag"

#include "primitives.frag"
#include "operations.frag"

#include "models.frag"

#define MAX_PLAYERS 10

uniform vec3 LightPos;
uniform int PlayersNum;
uniform vec3 PlayersPos[MAX_PLAYERS];

vec2 SDF( vec3 Point )
{
//  vec2 Prism = vec2(sdTexture(Point), 1.0);
  vec2 Players = vec2(1000.0, 0.0);

  for (int i = 0; i < MAX_PLAYERS; i++)
    if (i < PlayersNum)
      Players = opU(Players, vec2(sdSphere(Point - PlayersPos[i], 0.03), 3.0));

  vec2 Prism = vec2(sdHexPrism(RotateX(Point, 90.0 / 180.0 * Pi), vec2(0.1, 0.2)), 1.0);
  float h = 0.0;
  Prism = vec2( opS(
               		             sdTorus82(  Point-vec3(-0.0,h, 0.0), vec2(0.20,0.1)),
               	                 sdCylinder(  opRep( vec3(atan(Point.x+0.0,Point.z)/6.2831,
               											  Point.y,
               											  0.02+0.5*length(Point-vec3(0.0,h, 0.0))),
               									     vec3(0.05,1.0,0.05)), vec2(0.02,0.6))), 51.0 );
  vec2 Plane = vec2(sdPlane(Point, -0.1), 2.0);
  vec2 LightSource = vec2(sdSphere(Point - LightPos, 0.03), -1.0);

  return opU(opU(opU(Prism, Plane), LightSource), Players);
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
/*Lighting*/    Color = Lighting(Position);
  }
  else
    Color = vec4(0.0, 0.0, 0.0, 1.0); //Skybox(V);
}
