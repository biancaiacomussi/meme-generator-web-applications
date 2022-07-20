const Meme = (props) => {

    return (
      <>
        <div className="container m-0 p-0" >
          <img style={{ width: '100%' }} alt="Meme" src={`${props.templates_dict[props.meme.template_id]}`} />
          {props.meme.text1 && <p id={`text1-${props.meme.template_id}`} className={`${props.meme.font} thick meme-text ${props.meme.shadow}`} style={{ color: `${props.meme.color}` }}>{props.meme.text1}</p>}
          {props.meme.text2 && <p id={`text2-${props.meme.template_id}`} className={`${props.meme.font} thick meme-text ${props.meme.shadow}`} style={{ color: `${props.meme.color}` }}>{props.meme.text2}</p>}
          {props.meme.text3 && <p id={`text3-${props.meme.template_id}`} className={`${props.meme.font} thick meme-text ${props.meme.shadow}`} style={{ color: `${props.meme.color}` }}>{props.meme.text3}</p>}
        </div>
      </>
    )
  }

  export default Meme;