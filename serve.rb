#!/usr/bin/env ruby
# Static server for www/. Uses WEBrick from the ruby that ships with macOS,
# so there is nothing to install. Correct MIME types matter here: a manifest
# served as octet-stream stops the browser offering "Install".

require "webrick"

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

trap("INT")  { server.shutdown }
trap("TERM") { server.shutdown }

$stderr.puts "Ride Report serving #{root} on http://localhost:#{port}"
server.start
