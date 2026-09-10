import { entityFormFields } from "@/utils/EntityForm"
import { convertToPersianDigits } from "@/utils/numbers"
import { CloudDownload } from "@mui/icons-material"
import { IconButton, Tooltip } from "@mui/material"
import { format } from "date-fns-jalali"

const optionTypedFields = ['switch', 'radio', 'select']

export const getField = (item: any, key: any, entity: string) => {
  const fieldItem = entityFormFields[entity][key]
  if (optionTypedFields.includes(fieldItem.type) ) {
    return (<span>{fieldItem.options?.find(opt => opt.value === item[key])?.label }</span>)
  } else if (fieldItem.type === 'date') {
    return (<span>{convertToPersianDigits(format(item[key], "yyyy/MM/dd"))}</span>)
  } else if (fieldItem.type === 'file') {
    return (
      <span>
        <IconButton disabled={!item[key]} color='info' aria-label="دانلود" href={item[key]} download>
          <Tooltip title={'دانلود'} arrow placement="top">
            <CloudDownload />
          </Tooltip>
        </IconButton>
      </span>
    )
  } else {
    return (<span>{item[key]}</span>)
  }
}

export const getFieldTitle = (item: any, key: any, entity: string) => {
  const fieldItem = entityFormFields[entity][key]
  if (optionTypedFields.includes(fieldItem.type) ) {
    return fieldItem.options?.find(opt => opt.value === item[key])?.label 
  } else if (fieldItem.type === 'date') {
    return convertToPersianDigits(format(item[key], "yyyy/MM/dd"))
  } else {
    return item[key]
  }
}