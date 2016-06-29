vec4 Lighting( vec3 Position )
{
  vec3 LightColor = vec3(1.0, 1.0, 1.0);
  int Material = GetMaterial(Position);
  vec3 Ka = vec3(0.0);
  vec3 Ke = vec3(0.0);
  vec3 Kd = vec3(0.3, 1.0, 0.8);
  vec3 Ks = vec3(0.2);
  float Kp = 0.6;
  vec3 Color = vec3(0.0, 0.0, 0.0);
  float Shadow = 1.0;

  Shadow = IntersectShadow(Position, LightPos);

  if (Shadow < 0.1)
    return vec4(Ka + Ke, 1.0);

  if (Material == 2)
    Kd = vec3(0.7, 0.0, 0.0);

  if (Material == -1)
    return vec4(LightColor, 1);

  if (Material == 3)
    Kd = vec3(0.0, 1.0, 0.0);

//    return vec4(Normal(Position), 1.0);

  Color += Ka;

  Color += Kd * dot(Normal(Position), normalize(LightPos - Position));

  vec3 Reflect;

  Reflect = normalize(2.0 * Normal(Position) + normalize(Position - LightPos));

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
