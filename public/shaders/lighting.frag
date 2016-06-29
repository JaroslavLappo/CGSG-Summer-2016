vec4 GetLightingPoint( vec3 Position, vec3 LightPos, vec3 Normal, int Material )
{
  vec3 LightColor = vec3(1.0, 1.0, 1.0);
  vec3 Ka  = Materials[Material].Ka;
  vec3 Kd  = Materials[Material].Kd;
  vec3 Ks  = Materials[Material].Ks;
  float Kp = Materials[Material].Kp;
  vec3 Ke  = Materials[Material].Ke;
  vec3 Color = vec3(0.0, 0.0, 0.0);
  float Shadow = 1.0;

  Shadow = IntersectShadow(Position, LightPos);

  if (Shadow < 0.1)
    return vec4(Ka + Ke, 1.0);

  if (Material == -2)
    return vec4(LightColor, 1);

//    return vec4(Normal(Position), 1.0);

  Color += Ka * LightColor;

  Color += Kd * dot(Normal, normalize(LightPos - Position));

  vec3 Reflect;

  Reflect = normalize(2.0 * Normal + normalize(Position - LightPos));

  float ReflectRes = dot(normalize(CamPos - Position), Reflect);

  if (ReflectRes > 0.0)
    Color += Ks * pow(ReflectRes, Kp);

  Color *= LightColor;

  Color += Ke;

  float dist = length(Position - LightPos);

  if (dist > 2.0)
    return vec4(0.0, 0.0, 0.0, 1.0);
  return vec4((1.0 - dist / 2.0) * Color, 1);
}

vec4 Lighting( vec3 Position )
{
  return GetLightingPoint(Position, LightPoint[0], GetNormal(Position), GetMaterial(Position));
}
