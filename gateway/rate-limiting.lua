local _M = {}

-- Configurações de rate limiting por nível de KYC
local KYC_LIMITS = {
  LEVEL_0 = {
    minute = 20,
    hour = 100,
    day = 200
  },
  LEVEL_1 = {
    minute = 50,
    hour = 300,
    day = 1000
  },
  LEVEL_2 = {
    minute = 100,
    hour = 1000,
    day = 5000
  },
  LEVEL_3 = {
    minute = 200,
    hour = 2000,
    day = 10000
  }
}

-- Função para obter o nível de KYC do usuário
local function get_kyc_level(consumer_id)
  -- Implementar lógica para buscar nível KYC do usuário
  -- Por padrão, retorna LEVEL_0
  return "LEVEL_0"
end

function _M.execute(conf)
  -- Obtém o consumer ID do token JWT
  local consumer_id = ngx.ctx.authenticated_consumer and ngx.ctx.authenticated_consumer.id

  if not consumer_id then
    return kong.response.error(401, "Unauthorized")
  end

  -- Obtém o nível KYC do usuário
  local kyc_level = get_kyc_level(consumer_id)
  local limits = KYC_LIMITS[kyc_level]

  if not limits then
    return kong.response.error(500, "Invalid KYC level")
  end

  -- Aplica rate limiting baseado no nível KYC
  local ok, err = kong.ratelimiting.get_usage({
    identifier = consumer_id,
    window_size = {
      minute = limits.minute,
      hour = limits.hour,
      day = limits.day
    }
  })

  if not ok then
    return kong.response.error(429, "Rate limit exceeded")
  end
end

return _M
