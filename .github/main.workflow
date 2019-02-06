workflow "Run Tests" {
  on = "push"
  resolves = ["yarn version"]
}

action "Run arbitrary commands" {
  uses = "actions/npm@master"
  runs = "yarn"
  args = ["shell", "ls", "-al", ";", "exit", "78"]
}
