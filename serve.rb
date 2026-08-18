#!/usr/bin/env ruby
# Static server for www/. Uses WEBrick from the ruby that ships with macOS,
# so there is nothing to install. Correct MIME types matter here: a manifest
# served as octet-stream stops the browser offering "Install".

require "webrick"
require "json"

root = File.expand_path("www", __dir__)
port = (ENV["PORT"] || 8080).to_i

mime = WEBrick::HTTPUtils::DefaultMimeTypes.dup
mime["webmanifest"] = "application/manifest+json"
mime["js"]          = "text/javascript"
mime["json"]        = "application/json"
mime["svg"]         = "image/svg+xml"

server = WEBrick::HTTPServer.new(
  Port:          port,
  BindAddress:   "127.0.0.1",
  DocumentRoot:  root,
  MimeTypes:     mime,
  AccessLog:     [],
  Logger:        WEBrick::Log.new($stderr, WEBrick::Log::WARN)
)

# The service worker must not be served from cache, or updates never land.
server.mount_proc "/sw.js" do |_req, res|
  res["Content-Type"]  = "text/javascript"
  res["Cache-Control"] = "no-cache"
  res.body = File.read(File.join(root, "sw.js"))
end

# ─── ADS-B proxy ───────────────────────────────────────────────────────────
# Live traffic needs a server-side hop, because none of the free ADS-B sources
# send CORS headers. The Cloudflare Worker was the obvious place for it and does
# not work: every source refuses Cloudflare's shared egress addresses (OpenSky
# times out, adsb.lol 429s, airplanes.live 403s), while all three answer in under
# a second from an ordinary machine.
#
# So it runs here instead. This host has a normal residential address, which is
# exactly what those APIs are happy to serve. Live traffic therefore works when
# the site is run locally and degrades with a stated reason when it is not.
require "net/http"
require "uri"

ADSB_SOURCES = {
  "adsblol"    => "https://api.adsb.lol/",
  "planeslive" => "https://api.airplanes.live/",
  "opensky"    => "https://opensky-network.org/api/",
}

server.mount_proc "/adsb" do |req, res|
  src  = req.query["src"].to_s
  path = req.query["path"].to_s
  base = ADSB_SOURCES[src]

  res["Access-Control-Allow-Origin"] = "*"
  res["Content-Type"] = "application/json"

  if base.nil? || path.include?("..")
    res.status = 400
    res.body = { error: "unknown source or bad path" }.to_json
    next
  end

  begin
    uri = URI.join(base, path.sub(%r{\A/+}, ""))
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 8
    http.read_timeout = 15
    # A descriptive agent is simple courtesy to a free service, and some of them
    # ask for one.
    upstream = http.get(uri.request_uri, {
      "Accept" => "application/json",
      "User-Agent" => "IDontLikeTurbulence/1.0 (personal, non-commercial)",
    })
    res.status = upstream.code.to_i
    res["Cache-Control"] = "public, max-age=20"
    res.body = upstream.body
  rescue => e
    # Never fabricate a position. If the source is unreachable, say so.
    res.status = 502
    res.body = { error: "upstream unreachable", detail: e.message[0, 160] }.to_json
  end
end

trap("INT")  { server.shutdown }
trap("TERM") { server.shutdown }

$stderr.puts "Ride Report serving #{root} on http://localhost:#{port}"
server.start
