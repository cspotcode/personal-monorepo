workflow "Run Tests" {
  on = "push"
  resolves = ["Run arbitrary commands"]
}

action "Run arbitrary commands" {
  uses = "actions/npm@master"
  runs = "yarn"
  args = ["shell", "exit", "78"]
}
