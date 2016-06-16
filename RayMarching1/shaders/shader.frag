precision mediump float;

float SDF( vec3 Point )
{
  return length(Point) - 1.0;
}

uniform vec3 CamPos;
uniform vec3 CamView;
uniform float ProjDist;

uniform int Width;
uniform int Height;

vec3 R( vec3 V, float T )
{
  return CamPos + V * T;
}

vec4 GetIntersection( vec3 V )
{
  float T = 0.0;
  float d = 0.0;

  for (int i = 0; i < 100; i++)
  {
    if ((d < 0.0 || d > 100.0) && i != 0)
      break;

    d = SDF(R(V, T));
    T += d;
  }

  if (SDF(R(V, T)) < 0.02)
    return vec4(R(V, T), 1.0);
  else
    return vec4(0.0, 0.0, 0.0, 0.0);
}

void main(void)
{
  vec3 CamViewProjDist;
  float XOff, YOff;
  vec3 V;
  float XScale = float(Width);
  float YScale = float(Height);

  if (Width > Height)
    YScale *= float(Width) / float(Height);
  else
    XScale *= float(Height) / float(Width);

  vec3 Up = vec3(0, 1, 0);
  vec3 Right = normalize(cross(CamView, Up));

  XOff = (gl_FragCoord.x - float(Width) / 2.0) / XScale;
  YOff = (gl_FragCoord.y - float(Height) / 2.0) / YScale;

  CamViewProjDist = normalize(CamView) * ProjDist;

  V = normalize(CamViewProjDist + XOff * Right + YOff * Up);

  vec4 Inter = GetIntersection(V);

  if (Inter.w > 0.5)
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}
