require 'rubygems'      # <-- Added this require
require 'em-websocket'
require 'sinatra/base'
require './github-api.rb'

EventMachine.run do     # <-- Changed EM to EventMachine
  class App < Sinatra::Base
      get '/' do
          File.read(File.join('public', 'index.html'))
      end
  end

  EventMachine::WebSocket.start(:host => '0.0.0.0', :port => 8080) do |ws| # <-- Added |ws|
      # Websocket code here
      @github_client = GithubApi.new
      
      ws.onopen {
          #ws.send "connected!!!!"
          puts "Ping supported: #{ws.pingable?}"
          timer = EM.add_periodic_timer(1) {
            @github_events = @github_client.get_json_events
            p ["Sent ping", ws.ping('hello')]
          }   
      }

      ws.onmessage { |msg|
          puts "got message #{msg}"
      }
      
      ws.onpong { |value|
        puts "Received pong: #{value}"
        ws.send(@github_events)
      }

      ws.onclose   {
        EM.cancel_timer(timer)
        ws.send "WebSocket closed"
      }
      
      ws.onerror { |e|
        puts "Error: #{e.message}"
      }

  end

  App.run!({:port => 3000})
end