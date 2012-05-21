require 'octokit'

class GithubApi
  
  @new_events  
  @old_events
  
  def initialize
    @old_events =[]
  end
  
  def get_json_events
    @new_events = []
    begin
      @github_events = Octokit.public_events
    rescue => e
      puts e
    end
    get_events_repo
    @old_events += @new_events
    @new_events.to_json
  end
  
  #get repo details for each event
  def get_events_repo
    @github_events.each do |event|
      repo = ""
    	if event.repo.name && event.repo.name != "/"
    	  puts event.repo.name
    	  begin
      	  repo = Octokit.repo(event.repo.name)
      	  event.repo.language = repo.language if repo.language
      	  event.repo.watchers = repo.watchers if repo.watchers
      	rescue => e
          puts e
        end
      end
      flatten_event(event, repo)
    end
  end
  
  #create a list of unique events like this: event_id	event_type user repo watchers	language
  def flatten_event(event, repo)
    lang = repo.language if repo != ""
    watchers = repo.watchers if repo != ""
    obj = {
      :event_id => event.id,
      :event_type => event.type,
      :user => event.actor.login,
      :repo => event.repo.name,
      :watchers =>watchers,
      :lang => lang
    }
    @new_events.push(obj) if @old_events.index { |i| i[:event_id] == event.id }.nil?
  end
end