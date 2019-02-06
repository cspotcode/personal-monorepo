workflow "Run Tests" {
  on = "push"
  resolves = ["yarn version"]
}

action "yarn version" {
  uses = "actions/npm@master"
  runs = "yarn"
  args = "version"
}
