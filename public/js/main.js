const deleteBoxButtons = document.querySelectorAll('.deleteBoxButtons')

Array.from(deleteBoxButtons).forEach((element) => {
  element.addEventListener('click', dropBox)
})

async function dropBox(){
  const boxName = this.id
  console.log(boxName)
  try{
    const response = await fetch('deleteBox', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'boxName': boxName
      })
    })
    const data = await response.json()
    console.log(data)
    location.reload()
  }
  catch(err){
    console.log(err)
  }
}